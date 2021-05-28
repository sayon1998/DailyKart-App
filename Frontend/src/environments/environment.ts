// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyDtAUt8OGlhJvlAsdt5a0Bfwt6GzJph8IQ',
    authDomain: 'dailykart-57abc.firebaseapp.com',
    projectId: 'dailykart-57abc',
    storageBucket: 'dailykart-57abc.appspot.com',
    messagingSenderId: '609237155387',
    appId: '1:609237155387:web:1b69b082e5b093a045661e',
    measurementId: 'G-R9BBZWBBS7',
  },
  apiUrl: 'http://192.168.0.117:3000/api/',
  // apiUrl: 'http://localhost:3000/api/',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
