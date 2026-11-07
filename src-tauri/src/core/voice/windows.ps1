# Fixed, embedded Windows speech bridge. Requests are data on stdin, never code.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Console]::InputEncoding = New-Object Text.UTF8Encoding($false)
[Console]::OutputEncoding = New-Object Text.UTF8Encoding($false)
Import-Module (Join-Path $PSHOME 'Modules/Microsoft.PowerShell.Utility/Microsoft.PowerShell.Utility.psd1')
$engine = $null
$speechEvents = @()
try {
    Add-Type -AssemblyName System.Speech
    $request = [Console]::ReadLine() | ConvertFrom-Json
    $language = [Globalization.CultureInfo]::GetCultureInfo($request.locale)
    if ($request.operation -eq 'listen') {
        # Check the reply voice before opening the microphone or sending a turn.
        $probe = New-Object System.Speech.Synthesis.SpeechSynthesizer
        try {
            $available = @($probe.GetInstalledVoices() | Where-Object {
                $_.Enabled -and $_.VoiceInfo.Culture.TwoLetterISOLanguageName -eq $language.TwoLetterISOLanguageName
            })
            if (!$available.Count) { throw 'language-unavailable' }
        } finally { $probe.Dispose() }
        $recognizers = @([System.Speech.Recognition.SpeechRecognitionEngine]::InstalledRecognizers())
        $selected = $recognizers | Where-Object { $_.Culture.Name -eq $language.Name } | Select-Object -First 1
        if (!$selected) {
            $selected = $recognizers | Where-Object { $_.Culture.TwoLetterISOLanguageName -eq $language.TwoLetterISOLanguageName } | Select-Object -First 1
        }
        if (!$selected) { throw 'language-unavailable' }
        [Threading.Thread]::CurrentThread.CurrentCulture = $selected.Culture
        [Threading.Thread]::CurrentThread.CurrentUICulture = $selected.Culture
        $engine = New-Object System.Speech.Recognition.SpeechRecognitionEngine($selected)
        $engine.LoadGrammar((New-Object System.Speech.Recognition.DictationGrammar))
        $engine.SetInputToDefaultAudioDevice()
        $engine.InitialSilenceTimeout = [TimeSpan]::FromSeconds(20)
        $engine.BabbleTimeout = [TimeSpan]::FromSeconds(20)
        $engine.EndSilenceTimeout = [TimeSpan]::FromMilliseconds(800)
        $engine.EndSilenceTimeoutAmbiguous = [TimeSpan]::FromMilliseconds(1000)
        # Queue recognition events on this process's runspace. A synchronous
        # Recognize call cannot publish hypotheses while the user is speaking.
        Register-ObjectEvent $engine SpeechHypothesized -SourceIdentifier 'novera-partial' | Out-Null
        $speechEvents += 'novera-partial'
        Register-ObjectEvent $engine RecognizeCompleted -SourceIdentifier 'novera-complete' | Out-Null
        $speechEvents += 'novera-complete'
        $engine.RecognizeAsync([System.Speech.Recognition.RecognizeMode]::Single)
        $clock = [Diagnostics.Stopwatch]::StartNew()
        $result = $null
        while ($clock.Elapsed.TotalSeconds -lt 25) {
            foreach ($event in @(Get-Event -SourceIdentifier 'novera-partial' -ErrorAction SilentlyContinue)) {
                $partial = [string]$event.SourceEventArgs.Result.Text
                if ($partial) {
                    [Console]::WriteLine((@{status='partial';text=$partial} | ConvertTo-Json -Compress))
                }
                Remove-Event -EventIdentifier $event.EventIdentifier
            }
            $completed = Get-Event -SourceIdentifier 'novera-complete' -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($completed) {
                if ($completed.SourceEventArgs.Error) { throw 'recognition-failed' }
                $result = $completed.SourceEventArgs.Result
                Remove-Event -EventIdentifier $completed.EventIdentifier
                break
            }
            Start-Sleep -Milliseconds 100
        }
        $engine.RecognizeAsyncCancel()
        $response = @{ status = 'timeout'; text = '' }
        # A completed recognition result was accepted by the installed engine.
        # Its confidence scale varies by engine; an extra application cutoff
        # turned successful dictation into a misleading "unavailable" error.
        if ($result -and $result.Text) {
            $response = @{ status = 'recognized'; text = $result.Text }
        }
    } elseif ($request.operation -eq 'speak') {
        $engine = New-Object System.Speech.Synthesis.SpeechSynthesizer
        $voices = @($engine.GetInstalledVoices() | Where-Object Enabled)
        $selected = $voices | Where-Object { $_.VoiceInfo.Culture.Name -eq $language.Name } | Select-Object -First 1
        if (!$selected) {
            $selected = $voices | Where-Object { $_.VoiceInfo.Culture.TwoLetterISOLanguageName -eq $language.TwoLetterISOLanguageName } | Select-Object -First 1
        }
        if (!$selected) { throw 'language-unavailable' }
        $engine.SelectVoice($selected.VoiceInfo.Name)
        $engine.SetOutputToDefaultAudioDevice()
        $engine.Speak([string]$request.text)
        $response = @{ status = 'done'; text = '' }
    } else { throw 'unsupported-operation' }
} catch {
    # No transcript, raw error, device path or credential in diagnostics.
    $response = @{ status = 'unavailable'; text = '' }
} finally {
    foreach ($source in $speechEvents) {
        Unregister-Event -SourceIdentifier $source -ErrorAction SilentlyContinue
        Remove-Event -SourceIdentifier $source -ErrorAction SilentlyContinue
    }
    if ($engine) { $engine.Dispose() }
}
[Console]::WriteLine(($response | ConvertTo-Json -Compress))
