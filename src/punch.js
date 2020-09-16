const puppeteer = require("puppeteer");
const commandLineArgs = require('command-line-args');
require('dotenv').config()

const env = process.env

const optionDefinitions = [
    { name: 'show', alias: 's', type: Number, defaultValue: 10},
    { name: 'showall', alias: 'a', type: Boolean},
    { name: 'punchin', alias: 'i', type: Boolean},
    { name: 'punchout', alias: 'o', type: Boolean},
  ]
const options = commandLineArgs(optionDefinitions)

async function iframeAttachedByName(page, nameOrId) {                                                                  
    return new Promise(async resolve => {
      const pollingInterval = 1000;                                                                
      const poll = setInterval(async function waitForIFrameToLoad() {                                                                                                       
        const iFrame = page.frames().find(frame => frame.name() === nameOrId);                         
        if (iFrame) {                                                                                    
          clearInterval(poll);                                                                                  
          resolve(iFrame);                                                                               
        }                                                                                                                                                                         
        }, pollingInterval);                                                                                          
    });                                                                                                  
}

async function iframeAttachedBySrc(page, src) {                                                                  
  return new Promise(async resolve => {
    const pollingInterval = 1000;                                                                
    const poll = setInterval(async function waitForIFrameToLoad() {                                                                                                       
      const iFrame = page.frames().find(frame => frame.url().indexOf(src) > -1);                         
      if (iFrame) {                                                                                    
        clearInterval(poll);                                                                                  
        resolve(iFrame);                                                                               
      }                                                                                                                                                                         
      }, pollingInterval);                                                                                          
  });                                                                                                  
}

async function login(frame) {
  await frame.waitForSelector('#mainBody > #dOverlay > #dInput #txtID');
  await frame.type('#mainBody > #dOverlay > #dInput #txtID', env.USER_ID);
  await frame.waitForSelector('#mainBody > #dOverlay > #dInput #txtPassword');
  await frame.type('#mainBody > #dOverlay > #dInput #txtPassword', env.PASSWD);
  await frame.waitForSelector('#mainBody > #dOverlay > #dInput #btnLogin');
  await frame.click('#mainBody > #dOverlay > #dInput #btnLogin');

  await frame.waitForNavigation({waitUntil: ['networkidle2']});
}

async function getWorkHistory(frame) {
  await frame.waitForSelector('#spHistory_vp');
  return await frame.evaluate(() => {
    const rows = document.querySelectorAll('#spHistory_vp > table tr');
    return Array.from(rows, row => {
      const columns = row.querySelectorAll('td span');
      return Array.from(columns, column => column.innerHTML.replace( /\s|&nbsp;/g , ' ' ));
    });
  });
}

async function showWork(frame) {
    const histories = await getWorkHistory(frame);
    let showCount = Math.min(histories.length, options.show);
    if (options.showall) {
        showCount = histories.length;
    }
    for(let i = 0; i < showCount; i++) {
        console.log(histories[i]);
    }
}

async function punchIn(frame) {
  await frame.waitForSelector('#tblPattern2 #btnShukkinPattern2');
  await frame.click('#tblPattern2 #btnShukkinPattern2');
  await frame.waitForNavigation({waitUntil: ['networkidle2']});

  const histories = await getWorkHistory(frame);
  console.log(histories[0]);
}

async function punchOut(frame) {
  await frame.waitForSelector('#tblPattern2 #btnTaikinPattern2');
  await frame.click('#tblPattern2 #btnTaikinPattern2');
  await frame.waitForNavigation({waitUntil: ['networkidle2']});

  const histories = await getWorkHistory(frame);
  console.log(histories[0]);
}

puppeteer.launch().then(async browser => {
  const page = await browser.newPage();
  await page.goto(env.PUNCH_SITE, {waitUntil:'networkidle2'});

  const loginFrame = await iframeAttachedByName(page, 'frameMenu');
  await login(loginFrame);

  const dakokuFrame = await iframeAttachedBySrc(page, '/JACWeb30Sat/GadgetDakokuForKintai.aspx');
  if (options.punchin) {
    await punchIn(dakokuFrame);
  } else if (options.punchout) {
    await punchOut(dakokuFrame);
  } else {
    await showWork(dakokuFrame);
  }

  browser.close();
});

