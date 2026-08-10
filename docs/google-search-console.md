# Đưa UStudy lên Google Search

Các file SEO trong repository đã sẵn sàng sau khi deploy:

- `https://ustudy.hakhoi.io.vn/robots.txt`
- `https://ustudy.hakhoi.io.vn/sitemap.xml`
- `https://ustudy.hakhoi.io.vn/about/`

## Việc cần làm trên tài khoản Google

1. Mở [Google Search Console](https://search.google.com/search-console/) và thêm property `https://ustudy.hakhoi.io.vn/`.
2. Xác minh ownership. Với subdomain này, cách đơn giản nhất thường là xác minh URL-prefix bằng thẻ HTML hoặc file HTML do Search Console cung cấp. Không commit token xác minh vào source; thêm nó vào `index.html` hoặc Vercel environment/deployment theo đúng giá trị Google cấp.
3. Vào **Sitemaps**, nhập `sitemap.xml` và bấm Submit.
4. Mở **URL Inspection**, dán `https://ustudy.hakhoi.io.vn/`, chạy **Test live URL**, rồi bấm **Request indexing** nếu URL có thể index.
5. Lặp lại URL Inspection cho `https://ustudy.hakhoi.io.vn/about/`.

## Kiểm tra sau deploy

```text
https://ustudy.hakhoi.io.vn/robots.txt
https://ustudy.hakhoi.io.vn/sitemap.xml
https://ustudy.hakhoi.io.vn/about/
```

Hai file đầu phải trả nội dung text/XML thật, không phải HTML của ứng dụng. Sau vài ngày, kiểm tra bằng truy vấn:

```text
site:ustudy.hakhoi.io.vn
```

Request indexing không đảm bảo có kết quả ngay; Search Console là nơi theo dõi trạng thái crawl và index chính xác nhất.
