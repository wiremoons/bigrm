#!/usr/bin/env -S deno run --quiet --allow-read=. --allow-net=api.openweathermap.org --location https://wiremoons.com/bigrm
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
 * @details Program uses the OpenWeather Application Programming Interface (API) to get the latest weather forecast
 * for a given location in the 'big room' - aka outdoors on planet earth. The 'one call' API can be found
 * here: https://openweathermap.org/api/one-call-api
 * Application is written in TypeScript for use with the Deno runtime: https://deno.land/
 *
 * @note The program can be run with Deno using the command:
 * @code deno run --quiet --allow-read=. --allow-net=api.openweathermap.org --location https://wiremoons.com/bigrm bigrm.ts
 */

/**
 * @note The following application enhancements are anticipated:
 * @todo cli option reset API key by deleting an re-requesting it
 */

// Example weather forecast request (NB: ADD API KEY)
// curl -i -X GET "https://api.openweathermap.org/data/2.5/onecall?lat=51.419212&lon=-3.291481&exclude=minutely,hourly&units=metric&appid=<API-KEY-HERE>" -H "accept: application/json"
//

// check for API key: env + local storage

//--------------------------------
// MODULE IMPORTS
//--------------------------------
import {
  cliVersion,
  isNumber,
  isString,
} from "https://deno.land/x/deno_mod@0.7.1/mod.ts";
import { format, toIMF } from "https://deno.land/std@0.113.0/datetime/mod.ts";
import { parse } from "https://deno.land/std@0.113.0/flags/mod.ts";
import { basename } from "https://deno.land/std@0.113.0/path/mod.ts";

//--------------------------------
// COMMAND LINE ARGS FUNCTIONS
//--------------------------------

/** Define the command line argument switches and options to be used */
const cliOpts = {
  default: { d: false, h: false, v: false },
  alias: { d: "delete", h: "help", v: "version" },
  stopEarly: true,
  unknown: showUnknown,
};

/** define options for `cliVersion()` function for application version data */
const versionOptions = {
  version: "0.6.1",
  copyrightName: "Simon Rowe",
  licenseUrl: "https://github.com/wiremoons/bigrm/",
  crYear: "2021",
};

/** obtain any command line arguments and exec them as needed */
async function getCliArgs() {
  //console.log(parse(Deno.args,cliOpts));
  const cliArgs = parse(Deno.args, cliOpts);

  if (cliArgs.delete) {
    delApiKey()
      ? console.log("API key deleted.")
      : console.log("API key not found.");
    Deno.exit(0);
  }

  if (cliArgs.help) {
    showHelp();
    Deno.exit(0);
  }

  if (cliArgs.version) {
    const versionData = await cliVersion(versionOptions);
    console.log(versionData);
    Deno.exit(0);
  }
}

/** Function defined in `cliOpts` so is run automatically by `parse()` if an unknown
 * command line option is given by the user.
 * @code showUnknown(arg: string, k?: string, v?: unknown)
 */
function showUnknown(arg: string) {
  console.error(`\nERROR: Unknown argument: '${arg}'`);
  showHelp();
  Deno.exit(1);
}

/** Help display for application called when unknown command lines options are entered */
function showHelp() {
  console.log(`
Usage: ${getAppName()} [switches] [arguments]

[Switches]       [Arguments]   [Default Value]   [Description]
-d, --delete                        false        delete the currently stored OpenWeather API key               
-h, --help                          false        display help information
-v, --version                       false        display program version
`);
}

//--------------------------------
// LOCAL STORAGE FUNCTIONS
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
function askUserForApiKey(): string | undefined {
  if (confirm(`Do you have a valid OpenWeather API key [y/N] ?`)) {
    const owApiKey = prompt("Please enter your API key:");
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

/** Convert epoch date to date and time for display in output as a string */
function getDisplayDateTime(epochTime: number): string {
  //console.log(`Epoch time for conversion to data and time: ${epochTime}`);
  let dateUTC: Date;
  if (isNumber(epochTime)) {
    dateUTC = new Date(epochTime * 1000);
    //console.log(`Converted date to UTC format: ${dateUTC}`);
    return toIMF(new Date(dateUTC));
    //console.log(`Final data and time format: ${toIMF(new Date(dateUTC))}`);
  } else {
    return "UNKNOWN";
  }
}

/** Convert an epoch time to a formatted time only (no date) for display in output as a string */
function getDisplayTime(epochTime: number): string {
  //console.log(`Epoch time for conversion to a date: ${epochTime}`);
  let dateUTC: Date;
  if (isNumber(epochTime)) {
    dateUTC = new Date(epochTime * 1000);
    //console.log(`Converted date to UTC format: ${dateUTC}`);
    //return date only using `formatString`
    return format(dateUTC, "HH:mm");
  } else {
    return "UNKNOWN";
  }
}

/** Convert epoch date to day of the week name as a string */
function getDayName(epochTime: number): string {
  //console.log(`Epoch time for conversion to data and time: ${epochTime}`);
  let dateUTC: Date;
  if (isNumber(epochTime)) {
    dateUTC = new Date(epochTime * 1000);
    //console.log(`Converted date to UTC format: ${dateUTC}`);
    return (new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(
      dateUTC,
    )).toString();
    //console.log(`Final data and time format: ${toIMF(new Date(dateUTC))}`);
  } else {
    return "UNKNOWN";
  }
}
/** Return the name of the currently running program without the path included. */
function getAppName(): string {
  return `${basename(Deno.mainModule) ?? "UNKNOWN"}`;
}

// function extractDaily(owJson:any):string | undefined {
//   if (!isString(owJson)) return undefined;
//
//   const dailyData = owJson?.daily.map((entry)=>{
//     if (entry.dt === undefined  ) return undefined;
//
//     const dailyDT = getDayName(entry.dt);
//     return `On ${dailyDT} expect: ${entry.dt.clouds}`;
//   });
//
//   return dailyData.toString();
//
// }

//--------------------------------
// APPLICATION FUNCTIONS
//--------------------------------

/**
 * Obtain OpenWeather forecast JSON data and output to the screen
 */
async function getWeatherJson(owUrl: string): Promise<string> {
  const res = await fetch(owUrl);
  const owJson = await res.json();
  //console.log(owJson);

  // ensure weather alter data variable is available and initialised as empty
  let owAlterData:string;
  owAlterData = "";

  // get number of weather alerts or set to zero if none found
  const owAlerts: number = owJson.alerts ? owJson.alerts.length : 0;
  //console.log(`Alerts found: ${owAlerts}`);

  if (owAlerts > 0) {
    owAlterData = `\n» Alert: '${owJson.alerts[0].event}' issued by: '${
      owJson.alerts[0].sender_name
    }'.\n» Starting: ${
      getDisplayDateTime(owJson.alerts[0].start)
    } and ending: ${getDisplayDateTime(owJson.alerts[0].end)}.\n» Details: ${
      owJson.alerts[0].description
    }\n`;
  }

  return (`
CURRENT  WEATHER  FORECAST  DATA
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯
 » Weather timezone     : ${owJson.timezone}
 » Weather place name   : Barry, UK
 » Latitude & longitude : ${owJson.lat} °N, ${owJson.lon} °W
 » Forecast Date        : ${getDisplayDateTime(owJson.current.dt)}
 » Sunrise              : ${getDisplayTime(owJson.current.sunrise)}
 » Sunset               : ${getDisplayTime(owJson.current.sunset)}

 » Weather Currently
    Wind Speed          : ${owJson.current.wind_speed} mph 
    UV Index            : ${owJson.current.uvi}
    Humidity            : ${owJson.current.humidity} %
    Cloud Cover         : ${owJson.current.clouds} %
    Average Visibility  : ${owJson.current.visibility.toLocaleString()} metres
    Temperature         : ${owJson.current.temp.toFixed(1)}°C feels like: ${
    owJson.current.feels_like.toFixed(1)
  }°C
    Description         : ${
    owJson.current.weather[0].description ??
      "none available"
  }
    
 » Weather Outlook
    ${
    owJson.daily.map((entry: any) => {
      let result = `On ${getDayName(entry.dt)} expect `;
      result += `${entry.weather[0].description ?? "none available"} `;
      result += `with wind at ${entry.wind_speed ?? "UNKNOWN"} mph and `;
      result += `temperature of ${entry.temp.day ?? "UNKNOWN"}°C`;
      return result;
    }).join("\n    ")
  }
    
 » Weather Alerts    
    Alerts issued: ${owAlerts.toString()}
${owAlterData || ""}
    `);
}

//--------------------------------
// MAIN
//--------------------------------
if (import.meta.main) {
  if (Deno.args.length > 0) await getCliArgs();

  const owApiKey = getApiKey();
  if (!isString(owApiKey)) {
    console.error("\nERROR: Unable to proceed without an OpenWeather API key.");
    console.log(
      "\nFree or subscription API key options are available.\n" +
        "Request an OpenWeather API key here: https://openweathermap.org/price\n",
    );
    Deno.exit(1);
  }
  // debug code
  //console.log(`Current localStorage API key : '${owApiKey}'`);
  // use below to remove API key from localStorage while testing
  //delApiKey() ? console.log("API Key removed") : console.log("API Key removal failed");

  // create the final weather request url
  const owUrl =
    `https://api.openweathermap.org/data/2.5/onecall?lat=51.419212&lon=-3.291481&exclude=minutely,hourly&units=metric&appid=${owApiKey}`;

  console.log(`${await getWeatherJson(owUrl)}`);
}
