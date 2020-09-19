function RunBellaComponent($exePath){
    Write-Host "Starting component $exePath"
    $pinfo = New-Object System.Diagnostics.ProcessStartInfo
    $pinfo.FileName = $exePath
    $pinfo.Arguments = '-console'
    $pinfo.UseShellExecute = $true
    $pinfo.WorkingDirectory = [System.IO.Path]::GetDirectoryName($exePath)
    $p = New-Object System.Diagnostics.Process
    $p.StartInfo = $pinfo
    $p.Start()
}
$files =Get-ChildItem "BellaDomain.exe" -Path ..\src\ -Recurse

$numberOfComponents=0

foreach ($file in $files)
{
    $numberOfComponents++
    RunBellaComponent($file.FullName)
}

Write-Host "Number of started components: $($numberOfComponents)"

