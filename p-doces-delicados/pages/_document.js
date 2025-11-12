import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="pt-BR">
        <Head>
          {/* PWA Meta Tags */}
          <meta name="application-name" content="Doces Delicados" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Doces Delicados" />
          <meta name="description" content="Sistema de gestão para confeitaria" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-TileColor" content="#0f172a" />
          <meta name="msapplication-tap-highlight" content="no" />

          {/* CORREÇÃO: Theme color será atualizado dinamicamente via JavaScript */}
          <meta name="theme-color" content="#0f172a" id="theme-color-meta" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

          {/* Apple Touch Icons */}
          <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167x167.png" />

          {/* Web App Manifest */}
          <link rel="manifest" href="/manifest.json" />

          {/* Favicon */}
          <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />

          {/* Meta Tags para SEO PWA */}
          <meta name="keywords" content="confeitaria, docinhos, bolos, gestão, pwa" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Doces Delicados - Sistema de Gestão" />
          <meta property="og:description" content="Sistema de gestão completo para sua confeitaria" />
          <meta property="og:site_name" content="Doces Delicados" />

          <script
            dangerouslySetInnerHTML={{
              __html: `
      // Script para inicializar a barra de status com a cor correta
      function initializeStatusBar() {
        try {
          console.log('🎨 Inicializando barra de status com cor personalizada...');
          
          // Verificar tema
          const savedTheme = localStorage.getItem('theme') || 'dark';
          const savedColors = localStorage.getItem('colorSettings');
          
          let statusBarColor = '#0f172a'; // Fallback
          
          if (savedColors && savedTheme === 'dark') {
            const colorSettings = JSON.parse(savedColors);
            const { hue, saturation } = colorSettings;
            // Cor da navbar (escura mas personalizada)
            statusBarColor = \`hsl(\${hue}, \${Math.max(saturation * 0.3, 15)}%, 8%)\`;
          }
          
          // Aplicar meta tags
          const metaTags = [
            { name: 'theme-color', content: statusBarColor },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
            { name: 'msapplication-navbutton-color', content: statusBarColor }
          ];
          
          metaTags.forEach(meta => {
            let element = document.querySelector(\`meta[name="\${meta.name}"]\`);
            if (!element) {
              element = document.createElement('meta');
              element.name = meta.name;
              document.head.appendChild(element);
            }
            element.content = meta.content;
          });
          
          console.log('✅ Barra de status inicializada:', statusBarColor);
          
        } catch (error) {
          console.error('❌ Erro na inicialização:', error);
        }
      }
      
      // Executar quando DOM estiver pronto
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeStatusBar);
      } else {
        initializeStatusBar();
      }
      
      // Também executar quando a página ficar visível
      document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
          setTimeout(initializeStatusBar, 100);
        }
      });
    `
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />

        </body>
      </Html>
    )
  }
}

export default MyDocument