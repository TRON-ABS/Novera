import { beforeEach, describe, expect, it, vi } from 'vitest'
import { invoke } from '@tauri-apps/api/core'
import { creationStream } from './stream'
import { useMemoryPolicy } from '@/hooks/useMemoryPolicy'
import { useMediaLibrary } from '@/hooks/useMediaLibrary'
import { useCreation, creationDefaults } from '@/hooks/useCreation'
import type { UIMessage } from 'ai'

vi.mock('./memory', () => ({
  beginLocalMemory: async () => () => {},
  releaseFinishedMedia: async () => {},
}))
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }))
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: () => true }))
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key } }))
vi.mock('@/lib/backendStorage', () => ({
  backendStorage: {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  },
}))
const messages: UIMessage[] = [
  { id: 'u', role: 'user', parts: [{ type: 'text', text: 'a picture' }] },
]
async function read(stream: ReturnType<typeof creationStream>) {
  const chunks = []
  const reader = stream.getReader()
  for (;;) {
    const value = await reader.read()
    if (value.done) return chunks
    chunks.push(value.value)
  }
}
describe('media generation conversation stream', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useMemoryPolicy.setState({ policy: 'auto', waiting: {} })
    useCreation.setState({
      settings: {
        ...creationDefaults,
        python: 'python315',
        imageModel: '/image-model',
        videoModel: '/video-model',
      },
      modes: {},
      sources: {},
      progress: {},
    })
  })
  it('uses the saved media configuration for this thread rather than another thread’s current settings', async () => {
    useMediaLibrary.setState({
      profiles: [
        {
          id: 'media-flux',
          name: 'Saved FLUX',
          task: 'image',
          settings: {
            ...creationDefaults,
            imageEngine: 'sdcpp',
            ggufImageModel: 'D:/saved-flux.gguf',
            ggufTextEncoder: 'D:/saved-qwen.gguf',
            ggufVae: 'D:/saved-vae.safetensors',
          },
        },
      ],
    })
    useCreation.getState().setSelection('saved-thread', 'image', {
      provider: 'diffusers',
      id: 'media-flux',
    })
    vi.mocked(invoke).mockImplementation(async (command) =>
      command === 'creation_start'
        ? 'saved'
        : {
            stage: 'done',
            name: 'Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png',
          }
    )
    await read(
      creationStream(
        'image',
        'a picture',
        messages,
        'saved-thread',
        undefined,
        vi.fn()
      )
    )
    expect(invoke).toHaveBeenCalledWith(
      'creation_start',
      expect.objectContaining({
        request: expect.objectContaining({
          backend: 'sdcpp',
          model: 'D:/saved-flux.gguf',
          cpp_llm: 'D:/saved-qwen.gguf',
        }),
      })
    )
    useMediaLibrary.setState({ profiles: [] })
  })
  it('passes the explicit global Manual policy to the native worker', async () => {
    useMemoryPolicy.getState().setPolicy('manual')
    vi.mocked(invoke).mockImplementation(async (command) =>
      command === 'creation_start'
        ? 'parallel'
        : {
            stage: 'done',
            name: 'Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png',
          }
    )
    await read(
      creationStream(
        'image',
        'a picture',
        messages,
        'parallel',
        undefined,
        vi.fn()
      )
    )
    expect(invoke).toHaveBeenCalledWith(
      'creation_start',
      expect.objectContaining({
        request: expect.objectContaining({ memory_policy: 'manual' }),
      })
    )
  })
  it('allows the bundled image engine without asking for an executable path', async () => {
    useCreation.getState().setSettings({
      imageEngine: 'sdcpp',
      cppExecutable: '',
      ggufImageModel: 'D:/flux.gguf',
      ggufTextEncoder: 'D:/qwen.gguf',
      ggufVae: 'D:/vae.safetensors',
    })
    vi.mocked(invoke).mockImplementation(async (command) =>
      command === 'creation_start'
        ? 'built-in'
        : {
            stage: 'done',
            name: 'Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png',
          }
    )
    const chunks = await read(
      creationStream(
        'image',
        'a picture',
        messages,
        'bundled',
        undefined,
        vi.fn()
      )
    )
    expect(invoke).toHaveBeenCalledWith(
      'creation_start',
      expect.objectContaining({
        request: expect.objectContaining({
          backend: 'sdcpp',
          cpp_executable: '',
        }),
      })
    )
    expect(chunks.some((chunk) => chunk.type === 'file')).toBe(true)
  })
  it('emits a file only after native save is complete and uses the selected media model', async () => {
    vi.mocked(invoke).mockImplementation(async (command) =>
      command === 'creation_start'
        ? 'job1'
        : {
            stage: 'done',
            name: 'Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png',
          }
    )
    const finish = vi.fn()
    const chunks = await read(
      creationStream(
        'image',
        'a picture',
        messages,
        'thread1',
        undefined,
        finish
      )
    )
    expect(invoke).toHaveBeenCalledWith(
      'creation_start',
      expect.objectContaining({
        request: expect.objectContaining({
          model: '/image-model',
          python: 'python315',
          task: 'image',
        }),
      })
    )
    expect(chunks.map((chunk) => chunk.type)).toEqual([
      'start',
      'file',
      'text-start',
      'text-delta',
      'text-end',
      'finish',
    ])
    expect(chunks[1]).toMatchObject({
      mediaType: 'image/png',
      url: expect.stringMatching(/^novera-creation:image\//),
    })
    expect(finish).toHaveBeenCalledTimes(1)
    expect(useCreation.getState().progress.thread1).toBeUndefined()
  })
  it.each([
    ['D:/models/image-nvfp4.safetensors', 'D:/models/uncensored-q4.gguf'],
    ['D:/models/image.gguf', 'D:/models/qwen3.safetensors'],
  ])(
    'keeps mixed components separate while preparing and waiting for the saved image: %s',
    async (image, encoder) => {
      useCreation.getState().setSettings({
        imageEngine: 'sdcpp',
        ggufImageModel: image,
        ggufTextEncoder: encoder,
        ggufVae: 'D:/models/vae.safetensors',
        cppExecutable: 'D:/engine/sd-cli.exe',
      })
      let reports = 0
      const stages: string[] = []
      const unsubscribe = useCreation.subscribe((state) => {
        const value = state.progress.mix
        if (value) stages.push(value.stage)
      })
      vi.mocked(invoke).mockImplementation(async (command) => {
        if (command === 'creation_start') return 'mix-job'
        reports++
        return reports === 1
          ? { stage: 'loading', progress: 40 }
          : reports === 2
            ? { stage: 'generating', progress: -1 }
            : {
                stage: 'done',
                name: 'Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png',
              }
      })
      const chunks = await read(
        creationStream('image', 'a cabin', messages, 'mix', undefined, vi.fn())
      )
      unsubscribe()
      expect(invoke).toHaveBeenCalledWith(
        'creation_start',
        expect.objectContaining({
          request: expect.objectContaining({
            model: image,
            cpp_llm: encoder,
            backend: 'sdcpp',
          }),
        })
      )
      expect(stages).toContain('loading')
      expect(stages).toContain('generating')
      expect(chunks.filter((chunk) => chunk.type === 'file')).toHaveLength(1)
    }
  )
  it('routes image GGUF and Qwen encoder GGUF to the dedicated engine while retaining the Diffusers video path', async () => {
    useCreation.getState().setSettings({
      imageEngine: 'sdcpp',
      cppExecutable: 'D:/engine/sd-cli.exe',
      ggufImageModel: 'D:/models/flux2-klein-4b-q4.gguf',
      ggufTextEncoder: 'D:/models/Qwen3-4B-Q4_K_M.gguf',
      ggufVae: 'D:/models/flux2_ae.safetensors',
      ggufGuidance: 1,
    })
    vi.mocked(invoke).mockImplementation(async (command) =>
      command === 'creation_start'
        ? 'cpp-job'
        : {
            stage: 'done',
            name: 'Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png',
          }
    )
    const chunks = await read(
      creationStream(
        'image',
        'create',
        messages,
        'gguf-thread',
        undefined,
        vi.fn()
      )
    )
    expect(invoke).toHaveBeenCalledWith(
      'creation_start',
      expect.objectContaining({
        request: expect.objectContaining({
          backend: 'sdcpp',
          model: 'D:/models/flux2-klein-4b-q4.gguf',
          cpp_llm: 'D:/models/Qwen3-4B-Q4_K_M.gguf',
          cpp_vae: 'D:/models/flux2_ae.safetensors',
          cpp_executable: 'D:/engine/sd-cli.exe',
          cpp_cfg: 1,
        }),
      })
    )
    expect(chunks).toContainEqual(
      expect.objectContaining({
        type: 'text-delta',
        delta: expect.stringContaining('stable-diffusion.cpp'),
      })
    )
    vi.mocked(invoke).mockClear()
    await read(
      creationStream(
        'video',
        'create',
        messages,
        'gguf-thread',
        undefined,
        vi.fn()
      )
    )
    expect(invoke).toHaveBeenCalledWith(
      'creation_start',
      expect.objectContaining({
        request: expect.objectContaining({
          backend: 'diffusers',
          model: '/video-model',
        }),
      })
    )
  })
  it('surfaces engine failures without a fabricated output', async () => {
    vi.mocked(invoke).mockImplementation(async (command) =>
      command === 'creation_start'
        ? 'job2'
        : { stage: 'error', error: 'CUDA unavailable' }
    )
    const finish = vi.fn()
    await expect(
      read(
        creationStream(
          'video',
          'a video',
          messages,
          'thread2',
          undefined,
          finish
        )
      )
    ).rejects.toThrow('chat:creation.failed')
    expect(invoke).toHaveBeenCalledWith('creation_cancel', { id: 'job2' })
    expect(finish).toHaveBeenCalledTimes(1)
  })
  it('cancels a start that finishes after the user pressed Stop', async () => {
    const abort = new AbortController()
    vi.mocked(invoke).mockImplementation(async (command) => {
      if (command === 'creation_start') {
        abort.abort()
        return 'job3'
      }
      return undefined
    })
    await expect(
      read(
        creationStream(
          'image',
          'a picture',
          messages,
          'thread3',
          abort.signal,
          vi.fn()
        )
      )
    ).rejects.toMatchObject({ name: 'AbortError' })
    expect(invoke).toHaveBeenCalledWith('creation_cancel', { id: 'job3' })
    expect(invoke).not.toHaveBeenCalledWith(
      'creation_status',
      expect.anything()
    )
  })
  it('rejects unsupported attachment combinations before starting a worker', async () => {
    const input: UIMessage[] = [
      {
        ...messages[0],
        parts: [
          {
            type: 'file',
            mediaType: 'video/mp4',
            url: 'data:video/mp4;base64,AAAA',
          },
        ],
      },
    ]
    await expect(
      read(
        creationStream('video', 'a video', input, 'thread4', undefined, vi.fn())
      )
    ).rejects.toThrow('chat:creation.inputUnsupported')
    expect(invoke).not.toHaveBeenCalled()
  })
  it('explains a text encoder selected as a diffusion model without emitting a file', async () => {
    vi.mocked(invoke).mockRejectedValue('CREATION_TEXT_ENCODER_AS_DIFFUSION')
    await expect(
      read(
        creationStream(
          'image',
          'create',
          messages,
          'wrong-role',
          undefined,
          vi.fn()
        )
      )
    ).rejects.toThrow('chat:creation.ggufWrongModel')
  })
  it('uses the previous generated image for an explicit animation request', async () => {
    vi.mocked(invoke).mockImplementation(async (command) =>
      command === 'creation_image_input'
        ? 'data:image/png;base64,AAAA'
        : command === 'creation_start'
          ? 'animation'
          : {
              stage: 'done',
              name: 'Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.mp4',
            }
    )
    const history: UIMessage[] = [
      {
        id: 'a',
        role: 'assistant',
        parts: [
          {
            type: 'file',
            mediaType: 'image/png',
            url: 'novera-creation:image/Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png',
          },
        ],
      },
      ...messages,
    ]
    await read(
      creationStream(
        'video',
        'Anime cette image',
        history,
        'thread5',
        undefined,
        vi.fn()
      )
    )
    expect(invoke).toHaveBeenCalledWith('creation_image_input', {
      name: 'Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png',
    })
    expect(invoke).toHaveBeenCalledWith(
      'creation_start',
      expect.objectContaining({
        request: expect.objectContaining({
          task: 'video',
          input_image: 'data:image/png;base64,AAAA',
        }),
      })
    )
  })
  it.each(['sdcpp', 'nvfp4-cuda'] as const)(
    'passes independent component devices to %s',
    async (engine) => {
      useCreation.getState().setSettings({
        imageEngine: engine,
        encoderDevice: 'cpu',
        device: 'cuda',
        cppExecutable: engine === 'sdcpp' ? 'D:/sd-cli.exe' : '',
        ggufImageModel: 'D:/flux.safetensors',
        ggufTextEncoder: 'D:/qwen.gguf',
        ggufVae: 'D:/vae.safetensors',
      })
      vi.mocked(invoke).mockImplementation(async (command) =>
        command === 'creation_start'
          ? 'native'
          : {
              stage: 'done',
              name: 'Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png',
            }
      )
      const chunks = await read(
        creationStream('image', 'cabin', messages, 'native', undefined, vi.fn())
      )
      expect(invoke).toHaveBeenCalledWith(
        'creation_start',
        expect.objectContaining({
          request: expect.objectContaining({
            backend: engine,
            device: 'cuda',
            encoder_device: 'cpu',
            model: 'D:/flux.safetensors',
          }),
        })
      )
      expect(chunks.filter((chunk) => chunk.type === 'file')).toHaveLength(1)
    }
  )
  it('refuses native FP4 on CPU before starting a process', async () => {
    useCreation.getState().setSettings({
      imageEngine: 'nvfp4-cuda',
      device: 'cpu',
      ggufImageModel: 'D:/flux.safetensors',
      ggufTextEncoder: 'D:/qwen.gguf',
      ggufVae: 'D:/vae.safetensors',
    })
    await expect(
      read(
        creationStream('image', 'cabin', messages, 'native', undefined, vi.fn())
      )
    ).rejects.toThrow('chat:creation.nativeNote')
    expect(invoke).not.toHaveBeenCalledWith('creation_start', expect.anything())
  })
  it.each(['image', 'video'] as const)(
    'attaches a portable duration to each completed local %s',
    async (task) => {
      vi.mocked(invoke).mockImplementation(async (command) =>
        command === 'creation_start'
          ? 'timed'
          : {
              stage: 'done',
              name:
                task === 'image'
                  ? 'Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png'
                  : 'Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.mp4',
              generation_seconds: 0.000001,
            }
      )
      const chunks = await read(
        creationStream(task, 'scene', messages, 'timed', undefined, vi.fn())
      )
      const file = chunks.find((chunk) => chunk.type === 'file')!
      expect(file).toMatchObject({
        providerMetadata: {
          novera: { totalMs: expect.any(Number), generationMs: 0.001 },
        },
      })
      expect(JSON.parse(JSON.stringify(file))).toEqual(file)
    }
  )
  it('explains a GGUF image selected for the native Safetensors FP4 backend before starting a process', async () => {
    useCreation.getState().setSettings({
      imageEngine: 'nvfp4-cuda',
      device: 'auto',
      ggufImageModel: 'D:/flux.gguf',
      ggufTextEncoder: 'D:/qwen.gguf',
      ggufVae: 'D:/vae.safetensors',
    })
    await expect(
      read(
        creationStream('image', 'scene', messages, 'native', undefined, vi.fn())
      )
    ).rejects.toThrow('chat:creation.nativeNote')
    expect(invoke).not.toHaveBeenCalledWith('creation_start', expect.anything())
  })
})
