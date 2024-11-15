'use server'
import puppeteer from 'puppeteer';


export const getTreinamentoHttp = async ({url} : {url: string}) => {
  console.log(url)
    async function scrapeWebsite(url: string) {
      console.log(url)
        // Lança o navegador em modo headless
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        
        // Abre uma nova página
        const page = await browser.newPage();
        
        // Navega até a URL especificada
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        // Espera um tempo adicional (opcional)
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        await delay(3000);

        // Extrai o título da página
        const pageTitle = await page.title();
        
        // Extrai o conteúdo das tags que você deseja
        let titulos = await page.$$eval('h1, h2, h3, h4, h5, h6', elements =>
          elements.map(el => el.textContent)
        );
        
        let paragrafos = await page.$$eval('p', elements =>
          elements.map(el => el.textContent)
        );

        let textosExtras = await page.$$eval('span', elements =>
          elements.map(el => el.textContent)
        );

        // textosExtras = textosExtras.concat(await page.$$eval('div', elements =>
        //   elements.map(el => el.textContent)
        // ));

        // Remove valores vazios e duplicados
        titulos = Array.from(new Set(titulos.filter(Boolean)));
        paragrafos = Array.from(new Set(paragrafos.filter(Boolean)));
        // textosExtras = Array.from(new Set(textosExtras.filter(Boolean)));
              
        // Fecha o navegador
        await browser.close();
      
        // Retorna os dados extraídos
        return {
            titulos,
            paragrafos,
            // textosExtras
        };
    }
      
    // Exemplo de uso
    return await scrapeWebsite(url).then(data => {
        console.log('Dados extraídos:', data);
        return {
          status: 'success',
          message: 'Dados extraídos com sucesso',
          data: data
        }
    }).catch(error => {
        console.error('Erro:', error);
        return {
          status: 'error',
          message: 'Erro ao tentar extrair os dados do website'
        }
    });
    
}
