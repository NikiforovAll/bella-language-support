
function RunBellaComponent($exePath){
    Write-Host "Starting component $exePath"
    $pinfo = New-Object System.Diagnostics.ProcessStartInfo
    $pinfo.FileName = $exePath
    $pinfo.Arguments = '-console -compileOnly'
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

$files = Get-ChildItem "BellaDomain.exe" -Path src/Domain -Recurse

$numberOfComponents=0

foreach ($file in $files)
{
    $numberOfComponents++
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
