Dim script
script = "C:\Users\koabe.MECOM1\src\product-results\scripts\run-import.bat"
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c """ & script & """", 0, False
