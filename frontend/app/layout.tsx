import type { Metadata } from "next";
import "./globals.css";
import NavToggle from "./NavToggle";

export const metadata: Metadata = {
  title: "独中通 | 全国独中择校与升学平台",
  description: "马来西亚全国独立中学资讯平台——查学校、比学费、看报考、查统考、校园生活一站式情报入口。",
  keywords: "独中, 马来西亚独中, UEC, 统考, 独立中学, 学费, 宿舍, 升学",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body suppressHydrationWarning>
        <nav className="glass-effect nav-container">
          <div className="container nav-content">
            <a href="/" className="logo">
              🎓 <span>独中通</span>
            </a>
            <NavToggle />
            <div className="nav-links" id="nav-links">
              <a href="/schools">找学校</a>
              <a href="/compare">比学校</a>
              <a href="/admissions">报考资讯</a>
              <a href="/uec">统考情报</a>
            </div>
          </div>
        </nav>

        <main className="main-content">
          {children}
        </main>

        <footer className="footer-container">
          <div className="container">
            <p>© 2026 独中通 DuZhong. All rights reserved. | 数据来源：各校官方网站与董总公开资料</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
