param([switch]$Scheduled)

# ---- Change these three lines --------------------------------------------
$excelFile  = "C:\Users\user\OneDrive - Trinity Western University\website-data.xlsx"
$siteFolder = "C:\Users\user\OneDrive - Trinity Western University\Desktop\website v1"
$sheets     = @("School", "Fun", "News", "Links", "Ideas")
# ---------------------------------------------------------------------------

$dataFolder = Join-Path $siteFolder "data"
$logFile    = Join-Path $env:USERPROFILE "website-update-log.txt"

function Log($msg) {
  $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $msg"
  Add-Content $logFile $line
  Write-Host $line
}

$excel = $null
try {
  Log "Starting update"
  if ($Scheduled) { Start-Sleep -Seconds 30 }

  if (-not (Test-Path $excelFile))  { throw "Workbook not found: $excelFile" }
  if (-not (Test-Path $siteFolder)) { throw "Site folder not found: $siteFolder" }

  New-Item -ItemType Directory -Force $dataFolder | Out-Null

  # Work on a temporary copy so OneDrive can't block Excel
  $tmpFile = Join-Path $env:TEMP "website-data-copy.xlsx"
  Copy-Item $excelFile $tmpFile -Force
  Log "Copied workbook"

  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false
  $excel.AskToUpdateLinks = $false

  $wb = $excel.Workbooks.Open($tmpFile, 0, $true)
  Log "Opened workbook"

  foreach ($name in $sheets) {
    $ws = $wb.Worksheets.Item($name)
    $range = $ws.UsedRange
    $rowCount = $range.Rows.Count
    $colCount = $range.Columns.Count
    $lines = @()

    for ($r = 1; $r -le $rowCount; $r++) {
      $cells = @()
      for ($c = 1; $c -le $colCount; $c++) {
        $cell = $range.Cells.Item($r, $c)
        $v = $cell.Value2
        if ($v -is [double] -and $cell.NumberFormat -match 'y|d.*m|m.*d') {
          $v = [DateTime]::FromOADate($v).ToString("yyyy-MM-dd")
        }
        if ($null -eq $v) { $v = "" }
        $cells += '"' + ([string]$v).Replace('"', '""') + '"'
      }
      $lines += ($cells -join ",")
    }

    $csv = Join-Path $dataFolder ($name.ToLower() + ".csv")
    [System.IO.File]::WriteAllLines($csv, $lines, (New-Object System.Text.UTF8Encoding($false)))
    Log "Exported $name"
  }
  $wb.Close($false)

  Set-Location $siteFolder
  git add data
  git diff --cached --quiet
  if ($LASTEXITCODE -ne 0) {
    git commit -m "Update website data"
    git push
    Log "Uploaded changes"
  } else {
    Log "No changes to upload"
  }
}
catch {
  Log "ERROR: $($_.Exception.Message)"
}
finally {
  if ($excel) {
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
  }
}
