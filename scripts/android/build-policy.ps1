function Test-NoveraAndroidBuildAllowed {
    param([object]$Report, [bool]$AllowUnreviewed, [bool]$IsGitHubActions)
    if ($Report.ready) { return $true }
    if (!$AllowUnreviewed -or !$IsGitHubActions) { return $false }
    $reviews = @('review-mobileDependencies', 'review-mobilePermissions', 'review-mobileStorage')
    $unapproved = @($Report.blockers | Where-Object { $_ -notin $reviews })
    return @($Report.blockers).Count -gt 0 -and $unapproved.Count -eq 0
}
