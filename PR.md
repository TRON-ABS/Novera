# fix(docs): add the Safetensors catalog count to the repository showcase

The Hugging Face model catalog section listed GGUF and MLX but omitted Safetensors after adding the Transformers engine. Add the official Safetensors repository count, **1,440,138 observed on 26 October 2026**, to both English and French READMEs with a direct source link.

Distinguish repository counts from verified Novera compatibility: the current Safetensors engine supports recognized causal text architectures in complete local folders; the format catalog also contains unsupported modalities, adapters and quantizations. Format counts overlap and must not be summed as unique models.

## Validation

The live official Hugging Face page reports `numTotalItems: 1440138`, matching its rendered model count. Source snapshot remains local under `.build/showcase-2026-10-26/`. Both README galleries and local links are rechecked; verify the published English/French GitHub rendering and About metadata after publication. No application changes, compilation or new application tests for this documentation-only update. Preserve license notices, binary release status and disabled GitHub Actions.
