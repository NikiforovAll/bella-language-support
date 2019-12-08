Get-ChildItem -Path ..\src\**\gen -Recurse | Remove-Item -force -recurse

Get-ChildItem -Path ..\src\**\storage -Recurse | Remove-Item -force -recurse

Get-ChildItem -Path ..\src\**\logs -Recurse | Remove-Item -force -recurse


Write-Host "Cleanup completed!"