
param (
    [bool]$run = $false,
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

function RunBellaComponent($exePath){
    $pinfo = New-Object System.Diagnostics.ProcessStartInfo
    $pinfo.FileName = $exePath
    $arguments = '-console ' + (?: {$run} {''} {'-compileOnly'})
    Write-Host "Starting component $exePath, args: $arguments"
    $pinfo.Arguments = $arguments
    $pinfo.RedirectStandardError = $true
    $pinfo.RedirectStandardOutput = $true
    $pinfo.UseShellExecute = $false
    $pinfo.WorkingDirectory = [System.IO.Path]::GetDirectoryName($exePath)
    $p = New-Object System.Diagnostics.Process
    $p.StartInfo = $pinfo
    $p.Start() | Out-Null
    $handle = $p.Handle # cache proc.Handle http://stackoverflow.com/a/23797762/1479211
    # $p.WaitForExit()
    $stdout = $p.StandardOutput.ReadToEnd()
    Write-Host $stdout
    return $p.ExitCode
}

$hasError = $false
$path = 'src/Domain/*/' + $componentRegex
$files = Get-ChildItem "BellaDomain.exe" -Path $path -Recurse

$numberOfComponents=0

foreach ($file in $files)
{
    if($file.FullName -notmatch '.*BellaDomain.exe'){
        continue
    }
    $numberOfComponents++
    Write-Host $file.FullName
    $exitCode = RunBellaComponent($file.FullName)
    $hasError = $hasError -or -not ($exitCode -eq 0)
}

Write-Host "Number of processed components: $($numberOfComponents)"

if($hasError){
    Write-Error 'Compile of bella components failed!'
    # return 1
}
else{
    Write-Host 'Success!'
}

Write-Host 'Press any key to exit...'

Read-Host

Write-Host 'Exit'
