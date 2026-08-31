# 重点商材CSV取込 タスクスケジューラ登録スクリプト
# このファイルを右クリック → "管理者として実行" してください

$ProjectDir = "C:\Users\koabe.MECOM1\src\product-results"
$TaskName   = "重点商材CSV取込"

Write-Host "タスク登録開始..." -ForegroundColor Cyan

$action = New-ScheduledTaskAction `
  -Execute "node" `
  -Argument "scripts\import-orders.mjs" `
  -WorkingDirectory $ProjectDir

$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At "08:00"

$settings = New-ScheduledTaskSettingsSet `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 10) `
  -RunOnlyIfNetworkAvailable

try {
  Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -RunLevel Highest `
    -Force | Out-Null

  Write-Host "登録成功: $TaskName" -ForegroundColor Green
  Write-Host ""
  Write-Host "「今すぐ実行」でテストしますか？ (y/n): " -NoNewline
  $ans = Read-Host
  if ($ans -eq "y") {
    Start-ScheduledTask -TaskName $TaskName
    Write-Host "実行しました。ログを確認: $ProjectDir\scripts\logs\" -ForegroundColor Yellow
  }
} catch {
  Write-Host "登録失敗: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "管理者として実行されているか確認してください。"
}

Write-Host ""
Write-Host "Enterキーで閉じます..."
Read-Host
