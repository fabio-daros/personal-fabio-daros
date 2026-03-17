import PageTitle from "@/components/PageTitle";
import Link from "next/link";

export const metadata = {
  title: "Portfolio - Fabio Daros",
  description: "Project portfolio",
};

const portfolioItems = [
  { img: "portfolio-1.webp", title: "App 1", category: "filter-app" },
  { img: "portfolio-10.webp", title: "Product 1", category: "filter-product" },
  { img: "portfolio-7.webp", title: "Branding 1", category: "filter-branding" },
  { img: "portfolio-4.webp", title: "Books 1", category: "filter-books" },
  { img: "portfolio-2.webp", title: "App 2", category: "filter-app" },
  { img: "portfolio-11.webp", title: "Product 2", category: "filter-product" },
  { img: "portfolio-8.webp", title: "Branding 2", category: "filter-branding" },
  { img: "portfolio-5.webp", title: "Books 2", category: "filter-books" },
  { img: "portfolio-3.webp", title: "App 3", category: "filter-app" },
  { img: "portfolio-12.webp", title: "Product 3", category: "filter-product" },
  { img: "portfolio-9.webp", title: "Branding 3", category: "filter-branding" },
  { img: "portfolio-6.webp", title: "Books 3", category: "filter-books" },
];

export default function PortfolioPage() {
  return (
    <main className="main">
      <PageTitle
        title="Portfolio"
        description="Odio et unde deleniti. Deserunt numquam exercitationem. Officiis quo odio sint voluptas consequatur ut a odio voluptatem."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Portfolio" }]}
      />

      <section id="portfolio" className="portfolio section">
        <div className="container">
          <div className="isotope-layout" data-default-filter="*" data-layout="masonry" data-sort="original-order">
            <ul className="portfolio-filters isotope-filters" data-aos="fade-up" data-aos-delay="100">
              <li data-filter="*" className="filter-active">All</li>
              <li data-filter=".filter-app">App</li>
              <li data-filter=".filter-product">Product</li>
              <li data-filter=".filter-branding">Branding</li>
              <li data-filter=".filter-books">Books</li>
            </ul>

            <div className="row gy-4 isotope-container" data-aos="fade-up" data-aos-delay="200">
              {portfolioItems.map((item, i) => (
                <div key={i} className={`col-lg-4 col-md-6 portfolio-item isotope-item ${item.category}`}>
                  <div className="portfolio-content h-100">
                    <img src={`/assets/img/portfolio/${item.img}`} className="img-fluid" alt={item.title} />
                    <div className="portfolio-info">
                      <h4>{item.title}</h4>
                      <p>Lorem ipsum, dolor sit amet consectetur</p>
                      <a href={`/assets/img/portfolio/${item.img}`} title={item.title} data-gallery="portfolio-gallery" className="glightbox preview-link">
                        <i className="bi bi-zoom-in"></i>
                      </a>
                      <Link href="/portfolio/1" title="More Details" className="details-link">
                        <i className="bi bi-link-45deg"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
