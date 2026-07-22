@echo off
cls
echo Ubuntu VPS'e baglaniliyor...

:: Gecici bir VBS dosyasi olusturup sifreyi otomatik bastiriyoruz
echo Set WshShell = CreateObject("WScript.Shell") > "%temp%\ssh_login.vbs"
echo WshShell.Run "cmd /c ssh root@155.254.35.250", 1, False >> "%temp%\ssh_login.vbs"
echo WScript.Sleep 1500 >> "%temp%\ssh_login.vbs"
echo WshShell.SendKeys "X8KkKiOQfuUXFI{ENTER}" >> "%temp%\ssh_login.vbs"

:: Olusturulan betigi calistir ve arka plani temizle
wscript "%temp%\ssh_login.vbs"
del "%temp%\ssh_login.vbs"