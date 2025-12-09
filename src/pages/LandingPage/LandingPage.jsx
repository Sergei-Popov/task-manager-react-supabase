import { Link } from "react-router-dom";
import styles from "./LandingPage.module.css";

function LandingPage() {
  return (
    <div className={styles.landing}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>✓</span>
          <span className={styles.logoText}>«Мои задачи»</span>
        </div>
        <nav className={styles.nav}>
          <a href="#features" className={styles.navLink}>
            Возможности
          </a>
          <a href="#preview" className={styles.navLink}>
            Превью
          </a>
          <a href="#benefits" className={styles.navLink}>
            Преимущества
          </a>
        </nav>
        <div className={styles.headerButtons}>
          <Link to="/login" className={styles.loginButton}>
            Войти
          </Link>
          <Link to="/registration" className={styles.signupButton}>
            Регистрация
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Управляйте задачами{" "}
            <span className={styles.gradient}>эффективно</span>
          </h1>
          <p className={styles.heroSubtitle}>
            «Мои задачи» — современный менеджер задач с интуитивным интерфейсом.
            Организуйте свои дела, устанавливайте дедлайны и достигайте целей.
          </p>
          <div className={styles.heroButtons}>
            <Link to="/registration" className={styles.primaryButton}>
              Начать бесплатно
              <span className={styles.buttonArrow}>→</span>
            </Link>
            <a href="#preview" className={styles.secondaryButton}>
              <span className={styles.playIcon}>▶</span>
              Смотреть демо
            </a>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>100%</span>
              <span className={styles.statLabel}>Бесплатно</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <span className={styles.statValue}>24/7</span>
              <span className={styles.statLabel}>Доступность</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <span className={styles.statValue}>∞</span>
              <span className={styles.statLabel}>Задач</span>
            </div>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroGlow}></div>
          <div
            className={styles.floatingCard}
            style={{ top: "10%", left: "5%" }}
          >
            <span>📋</span> Все задачи
          </div>
          <div
            className={styles.floatingCard}
            style={{ top: "30%", right: "0%" }}
          >
            <span>✅</span> Завершено
          </div>
          <div
            className={styles.floatingCard}
            style={{ bottom: "20%", left: "10%" }}
          >
            <span>⏳</span> В работе
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Возможности</span>
          <h2 className={styles.sectionTitle}>Всё для продуктивной работы</h2>
          <p className={styles.sectionSubtitle}>
            Мощные инструменты для организации ваших задач и проектов
          </p>
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div
              className={styles.featureIcon}
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              📝
            </div>
            <h3 className={styles.featureTitle}>Создание задач</h3>
            <p className={styles.featureDescription}>
              Быстро создавайте задачи с описанием, дедлайном и категорией
            </p>
          </div>
          <div className={styles.featureCard}>
            <div
              className={styles.featureIcon}
              style={{
                background: "linear-gradient(135deg, #ec4899, #f43f5e)",
              }}
            >
              🎨
            </div>
            <h3 className={styles.featureTitle}>Цветовая маркировка</h3>
            <p className={styles.featureDescription}>
              Выбирайте цвета для визуального разделения задач по приоритетам
            </p>
          </div>
          <div className={styles.featureCard}>
            <div
              className={styles.featureIcon}
              style={{
                background: "linear-gradient(135deg, #14b8a6, #22c55e)",
              }}
            >
              📂
            </div>
            <h3 className={styles.featureTitle}>Категории</h3>
            <p className={styles.featureDescription}>
              Организуйте задачи по категориям: работа, учёба, личное и другие
            </p>
          </div>
          <div className={styles.featureCard}>
            <div
              className={styles.featureIcon}
              style={{
                background: "linear-gradient(135deg, #f97316, #eab308)",
              }}
            >
              📅
            </div>
            <h3 className={styles.featureTitle}>Календарь</h3>
            <p className={styles.featureDescription}>
              Удобный календарь для выбора даты и времени дедлайна
            </p>
          </div>
          <div className={styles.featureCard}>
            <div
              className={styles.featureIcon}
              style={{
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              }}
            >
              📊
            </div>
            <h3 className={styles.featureTitle}>Статистика</h3>
            <p className={styles.featureDescription}>
              Отслеживайте прогресс: общее количество, завершённые и
              просроченные
            </p>
          </div>
          <div className={styles.featureCard}>
            <div
              className={styles.featureIcon}
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
              }}
            >
              📱
            </div>
            <h3 className={styles.featureTitle}>Адаптивность</h3>
            <p className={styles.featureDescription}>
              Работайте с любого устройства — компьютера, планшета или телефона
            </p>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section id="preview" className={styles.preview}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Превью</span>
          <h2 className={styles.sectionTitle}>Современный интерфейс</h2>
          <p className={styles.sectionSubtitle}>
            Минималистичный дизайн, который помогает сосредоточиться на главном
          </p>
        </div>
        <div className={styles.previewContainer}>
          <div className={styles.previewGlow}></div>
          <img
            src="/preview.png"
            alt="«Мои задачи» Dashboard Preview"
            className={styles.previewImage}
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className={styles.benefits}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Преимущества</span>
          <h2 className={styles.sectionTitle}>Почему «Мои задачи»?</h2>
        </div>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitItem}>
            <div className={styles.benefitNumber}>01</div>
            <div className={styles.benefitContent}>
              <h3>Простота использования</h3>
              <p>
                Интуитивный интерфейс не требует обучения. Начните работать
                сразу после регистрации.
              </p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <div className={styles.benefitNumber}>02</div>
            <div className={styles.benefitContent}>
              <h3>Облачное хранение</h3>
              <p>
                Ваши данные синхронизируются автоматически. Доступ с любого
                устройства в любое время.
              </p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <div className={styles.benefitNumber}>03</div>
            <div className={styles.benefitContent}>
              <h3>Безопасность</h3>
              <p>
                Защита данных на уровне банковских систем. Ваши задачи видите
                только вы.
              </p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <div className={styles.benefitNumber}>04</div>
            <div className={styles.benefitContent}>
              <h3>Без рекламы</h3>
              <p>
                Никакой рекламы и отвлекающих элементов. Только вы и ваши
                задачи.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaGlow}></div>
        <h2 className={styles.ctaTitle}>Готовы повысить продуктивность?</h2>
        <p className={styles.ctaSubtitle}>
          Присоединяйтесь к «Мои задачи» и начните организовывать свои задачи
          уже сегодня
        </p>
        <Link to="/registration" className={styles.ctaButton}>
          Создать аккаунт бесплатно
        </Link>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <span className={styles.logoIcon}>✓</span>
            <span className={styles.logoText}>«Мои задачи»</span>
          </div>
          <p className={styles.footerText}>
            © {new Date().getFullYear()} «Мои задачи». Создано с 💜
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
