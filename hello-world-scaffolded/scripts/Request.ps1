$url = "<url>"
$webservicex = New-WebServiceProxy -Uri $url -namespace WebServiceProxy -Class GlobalWeatherSoap
# $webservicex | gm
#$webservicex.<RequestName>(<params...>);