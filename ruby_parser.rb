require 'net/http'

url = URI.parse('http://madrobots.ru/htcCatalogNew.xml')
req = Net::HTTP::Get.new(url.to_s)
res = Net::HTTP.start(url.host, url.port) {|http|
  http.request(req)
}
res.body.force_encoding("cp1251").encode("utf-8", undef: :replace)
puts res.body.force_encoding("cp1251").encode("utf-8", undef: :replace)