
param (
    [switch]$run,
    [string]$componentRegex = "*"
)

set-alias ?: Invoke-Ternary -Option AllScope -Description "PSCX filter alias"
filter Invoke-Ternary ([scriptblock]$decider, [scriptblock]$ifTrue, [scriptblock]$ifFalse)
{
    if (&$decider) {
        &$ifTrue
    } else {
        &$ifFalse
    }
}

Write-Host "Regex:" $componentRegex
Write-Host "IsRun:" $run
$scriptpath=".\.vscode\CompileAllComponents.ps1"
$a = "$scriptpath -componentRegex " + $componentRegex + " -run " + (?: {$run} {'$true'} {'$false'})
Start-Process -Verb runas -FilePath powershell.exe -ArgumentList $a -wait -PassThru | Out-Null
