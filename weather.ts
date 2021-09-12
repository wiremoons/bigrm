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
 * @todo tbc
 */

// Example weather forcast request (NB: ADD API KEY)
// curl -i -X GET "https://api.openweathermap.org/data/2.5/onecall?lat=51.419212&lon=-3.291481&exclude=minutely,hourly&units=metric&appid=<API-KEY-HERE>" -H "accept: application/json"
//

// check for API key: env + local storage

//--------------------------------
// MODULE IMPORTS
//--------------------------------

//--------------------------------
// UTILITY FUNCTIONS
//--------------------------------

//--------------------------------
// APPLICATION FUNCTIONS
//--------------------------------

//--------------------------------
// MAIN
//--------------------------------
if (import.meta.main) {
  //await ??;
}
