#!/usr/bin/env -S deno run --quiet --allow-net=api.openweathermap.org --location https://wiremoons.com/bigrm
/**
 * @file bigrm.ts
 * @brief Obtain the latest weather forecast from OpenWeather.
 *
 * @author     simon rowe <simon@wiremoons.com>
 * @license    open-source released under "MIT License"
 * @source     https://github.com/wiremoons/bigrm
 *
 * @date originally created: 12 Sep 2021
 * @date updated significantly: tbc
 *
 * @details Program uses the OpenWeather Application Programming Interface (API) to get the latest weather forecast for a given location in the 'big room' - aka outdoors on planet earth. The 'one call' API can be found here: https://openweathermap.org/api/one-call-api
 * Application is written in TypeScript for use with the Deno runtime: https://deno.land/
 *
 * @note The program can be run with Deno using the command:
 * @code deno run --quiet --allow-net=api.openweathermap.org --location https://wiremoons.com/bigrm
 */

/**
 * @note The following application enhancements are anticipated:
 * @todo cli option reset API key by deleting an re-requesting it
 */

// Example weather forcast request (NB: ADD API KEY)
// curl -i -X GET "https://api.openweathermap.org/data/2.5/onecall?lat=51.419212&lon=-3.291481&exclude=minutely,hourly&units=metric&appid=<API-KEY-HERE>" -H "accept: application/json"
//

// check for API key: env + local storage

//--------------------------------
// MODULE IMPORTS
//--------------------------------
import {isString} from "https://deno.land/x/deno_mod@0.6.1/mod.ts";

//--------------------------------
// LOCALSTORAGE FUNCTIONS
//--------------------------------

/**
 * Attempts to write the users OpenWeather API key into `localStorage` using `Storage.setItem`.
 * @param owApiKey users OpenWeather key to be stored
 * @return true when its storage was attempted
 * @see If needed an alternative approach to using `localStorage` might be:
 * @code https://deno.land/x/config_dir@v0.1.1/mod.ts
 */
function setApiKeyId(owApiKey: string): boolean {
  if (isString(owApiKey) && owApiKey.length > 0) {
    localStorage.setItem("owApiKey", `${owApiKey}`);
    return true;
  }
  return false;
}

/**
 * Attempts to delete the users OpenWeather API key `owApiKey` from `localStorage` using `Storage.removeItem`.
 * @return true when its removal from storage was attempted
 */
function delApiKey(): boolean {
  if (localStorage.length > 0) {
    localStorage.removeItem("owApiKey");
    return true;
  }
  return false;
}

/**
 * Retrieve the users OpenWeather API key from `localStorage`
 * @returns owApiKey as the users OpenWeather API key or `undefined` on failure
 */
function getApiKey(): string | undefined {
  try {
    // check for any existing localStorage items
    if (localStorage.length > 0) {
      return (localStorage.getItem("owApiKey") ?? undefined);
    } else {
      // prompt the use to enter their API instead
      return askUserForApiKey();
    }
  } catch (err) {
    console.error(`\nERROR: trying to retrieved OpenWeather API key\n`);
    console.error(`Error message: '${err}'\n`);
    console.error(
      "Access to 'localStorage' is required by specifying  '--location https://wiremoons.com/bigrm' \ " +
        "as a command line flag when running the program. Exit.\n",
    );
    Deno.exit(1);
  }
  return undefined;
}

//--------------------------------
// UTILITY FUNCTIONS
//--------------------------------

/**
 * Request the users enters their OpenWeather API key and if valid store it in `localStorage`
 * @returns owApiKey as the users OpenWeather API key or `undefined` on failure
 */
function askUserForApiKey():string | undefined {

  if (confirm(`Do you have a valid OpenWeather API key [y/N] ?`)) {
    let owApiKey = prompt('Please enter your API key:');
    if (isString(owApiKey) && owApiKey.length > 0 && setApiKeyId(owApiKey)) {
      console.log(`'${owApiKey}' stored for future use.`);
      return owApiKey;
    } else {
      console.log(`Invalid key entered as: '${owApiKey}'`);
      return undefined;
    }
  }
  return undefined;
}

//--------------------------------
// APPLICATION FUNCTIONS
//--------------------------------

//--------------------------------
// MAIN
//--------------------------------
if (import.meta.main) {
  const owApiKey = getApiKey();
  if (!isString(owApiKey)) {
      console.error("Unable to proceed without an OpenWeather API key.");
      console.log("Free or subscription API key options are available. Request an OpenWeather API key here: https://openweathermap.org/price");
      Deno.exit(1);
  }
  // debug code
  console.log(`Current localStorage API key : '${owApiKey}'`);
  // use below to remove API key from localStorage while testing
  //delApiKey() ? console.log("API Key removed") : console.log("API Key removal failed");
  console.log("good path is running....");


}
