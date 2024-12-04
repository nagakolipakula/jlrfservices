sfdx force:org:list --all | Out-File -FilePath "orgList.txt"

Start-Process "notepad.exe" "orgList.txt"