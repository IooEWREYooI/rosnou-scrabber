const jsdom = require("jsdom")
const { JSDOM } = jsdom

const prompt = require("prompt-sync")({ sigint: true });

global.DOMParser = new JSDOM().window.DOMParser

async function fetchUrlWithCookie(url, cookies) {
    try {
        // Создаем объект опций для запроса
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `your_cookie_key=${cookies}`
            }
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            console.error(`Ошибка при запросе к ${url}:`, response.status);
            return;
        }

        const result = await response;

        console.log(`Ответ от ${url} успешно`);
        return await result.text();
    } catch (error) {
        console.error(`Ошибка при запросе к ${url}:`, error);
    }
}

async function processUrls(urls, cookies) {
    for (const url of urls) {
        await fetchUrlWithCookie(url, cookies);
    }
}

async function getLinksFromEducation(url, startWith, cookies) {

    let response = await fetchUrlWithCookie(url, cookies);

    const parser = new jsdom.JSDOM(response);

    const filteredLinks = Array.from(parser.window.document.querySelectorAll('a'))
    .filter(link => 
        link.href.startsWith(startWith)
    )
    .map(link => link.href);
    
    console.log(filteredLinks);

    return filteredLinks;
}

async function start() {

    const cookies = prompt("Введи куки свои : ");

    let base_page = await getLinksFromEducation('https://e-edu.rosnou.ru/my/', 'https://e-edu.rosnou.ru/course', cookies)

    for (const url of base_page) {
        await processUrls(await getLinksFromEducation(url, 'https://e-edu.rosnou.ru/mod', cookies), cookies);
    }
}

start();