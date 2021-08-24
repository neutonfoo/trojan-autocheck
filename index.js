require("dotenv").config();

const puppeteer = require("puppeteer");
const USC_USERNAME = process.env.USC_USERNAME;
const USC_PASSWORD = process.env.USC_PASSWORD;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Trojan Check Main Page
  await page.goto("https://trojancheck.usc.edu/login");
  await page.$eval("button[aria-label='Log in with your USC NetID']", el =>
    el.click()
  );

  // Shibboleth Login Page
  await page.waitForSelector("button[name='_eventId_proceed']");

  await page.$eval(
    "#username",
    (el, username) => (el.value = username),
    USC_USERNAME
  );
  await page.$eval(
    "#password",
    (el, password) => (el.value = password),
    USC_PASSWORD
  );
  await page.$eval("button[name='_eventId_proceed']", el => el.click());

  // Trojan Check Consent Page
  await page.waitForSelector("button.submit-button");
  await page.$eval("button.submit-button", el => el.click());

  try {
    // If already did Trojan Check
    // ---

    await page.waitForSelector(".day-pass");
  } catch {
    // Have not done Trojan Check yet
    // ---

    // Check Compliance
    await page.waitForSelector("button.btn-begin-assessment");
    await page.$eval("button.btn-begin-assessment", el => el.click());

    // Start Assessment
    await page.waitForSelector("button.btn-assessment-start");
    await page.$eval("button.btn-assessment-start", el => el.click());

    // Do any of these apply to you?
    await page.waitForSelector("button.btn-next");
    await page.$eval("button#mat-button-toggle-3-button", el => el.click());
    await page.$eval("button#mat-button-toggle-5-button", el => el.click());
    await page.$eval("button.btn-next", el => el.click());

    // Do you currently have any of the following symptoms (please answer regardless of why you believe you have the symptoms):
    await page.waitForSelector("button.btn-next");
    await page.$eval("button#mat-button-toggle-14-button", el => el.click());
    await page.$eval("button#mat-button-toggle-16-button", el => el.click());
    await page.$eval("button#mat-button-toggle-18-button", el => el.click());
    await page.$eval("button#mat-button-toggle-20-button", el => el.click());
    await page.$eval("button#mat-button-toggle-22-button", el => el.click());
    await page.$eval("button#mat-button-toggle-24-button", el => el.click());
    await page.$eval("button#mat-button-toggle-26-button", el => el.click());
    await page.$eval("button.btn-next", el => el.click());

    // I attest that my answers to the above wellness assessment questions are accurate.
    await page.waitForSelector("button.btn-submit");
    await page.$eval(".mat-checkbox-layout", el => el.click());
    await page.$eval("button.btn-submit", el => el.click());

    await page.waitForSelector(".day-pass");
  }

  const trojanPass = await page.$(".day-pass");

  const trojanPassBoundingBox = await trojanPass.boundingBox();
  const x = trojanPassBoundingBox["x"];
  const y = trojanPassBoundingBox["y"];
  const w = trojanPassBoundingBox["width"];
  const h = trojanPassBoundingBox["height"];

  await page.screenshot({
    path: "trojan_pass.png",
    clip: { x: x, y: y, width: w, height: h },
  });

  await browser.close();
})();
