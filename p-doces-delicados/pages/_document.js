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
          
          {/* CORREÇÃO: Theme color dinâmico - será atualizado via JavaScript */}
          <meta name="theme-color" content="#0f172a" id="theme-color-meta" />
          
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

          {/* Splash Screen para iOS */}
          <link rel="apple-touch-startup-image" href="/splashscreens/iphone5_splash.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
          <link rel="apple-touch-startup-image" href="/splashscreens/iphone6_splash.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
          <link rel="apple-touch-startup-image" href="/splashscreens/iphoneplus_splash.png" media="(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)" />
          <link rel="apple-touch-startup-image" href="/splashscreens/iphonex_splash.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
          <link rel="apple-touch-startup-image" href="/splashscreens/ipad_splash.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />

          {/* Meta Tags para SEO PWA */}
          <meta name="keywords" content="confeitaria, docinhos, bolos, gestão, pwa" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Doces Delicados - Sistema de Gestão" />
          <meta property="og:description" content="Sistema de gestão completo para sua confeitaria" />
          <meta property="og:site_name" content="Doces Delicados" />

          {/* Script para atualizar theme-color dinamicamente */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Função para atualizar a cor do tema dinamicamente
                function updateThemeColor() {
                  try {
                    const savedColors = localStorage.getItem('colorSettings');
                    const themeColorMeta = document.getElementById('theme-color-meta');
                    
                    if (savedColors && themeColorMeta) {
                      const colorSettings = JSON.parse(savedColors);
                      const { hue, saturation, lightness } = colorSettings;
                      
                      // Calcula uma cor escura para o theme-color (barra de status)
                      const darkColor = \`hsl(\${hue}, \${Math.max(saturation * 0.4, 20)}%, 8%)\`;
                      themeColorMeta.setAttribute('content', darkColor);
                    }
                  } catch (error) {
                    console.log('Erro ao atualizar theme-color:', error);
                  }
                }

                // Atualizar theme-color quando a página carregar
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', updateThemeColor);
                } else {
                  updateThemeColor();
                }

                // Observar mudanças no localStorage para cores personalizadas
                window.addEventListener('storage', updateThemeColor);
                
                // Também atualizar quando as cores mudarem via hook
                window.updatePWAThemeColor = updateThemeColor;
              `
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          
          {/* Script adicional para garantir que as cores sejam aplicadas */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Aplicar cores ao carregar a página
                function applyInitialColors() {
                  try {
                    // Verificar tema salvo
                    const savedTheme = localStorage.getItem('theme');
                    const body = document.body;
                    
                    // Aplicar tema
                    if (savedTheme) {
                      body.classList.remove('light', 'dark');
                      body.classList.add(savedTheme);
                    } else {
                      // Tema padrão escuro
                      body.classList.add('dark');
                    }
                    
                    // Aplicar cores personalizadas
                    const savedColors = localStorage.getItem('colorSettings');
                    if (savedColors) {
                      const colorSettings = JSON.parse(savedColors);
                      const root = document.documentElement;
                      
                      root.style.setProperty('--primary-hue', colorSettings.hue);
                      root.style.setProperty('--primary-saturation', \`\${colorSettings.saturation}%\`);
                      root.style.setProperty('--primary-lightness', \`\${colorSettings.lightness}%\`);
                      
                      // Atualizar PWA theme color
                      if (window.updatePWAThemeColor) {
                        window.updatePWAThemeColor();
                      }
                    }
                  } catch (error) {
                    console.log('Erro ao aplicar cores iniciais:', error);
                  }
                }
                
                // Executar quando a página estiver totalmente carregada
                if (document.readyState === 'complete') {
                  applyInitialColors();
                } else {
                  window.addEventListener('load', applyInitialColors);
                }
              `
            }}
          />
        </body>
      </Html>
    )
  }
}

export default MyDocument