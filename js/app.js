var map; //defines Google map that appears on left side of page
var defaultIcon; //defines the icon that appears on the Google Map before it is clicked
var highlightedIcon; //defines the highlighted icon that will appear on the Google Map after you have clicked it

function googleError() { //This is the error that will appear if the Google Map cannot be loaded
    $('#query-summary').text("Sorry, we couldn't load Google Maps! Are you sure you're connected to the internet?"); //If you attempt to search for a place, you'll receive this error message
    $('#list').hide(); //This will hide the emergency services list
}

/*
Features, Elemnts, and Stylers

featureType (optional) - the features to select for this style modification.
Features are geographic characteristics on the map, including oads, parks, bodies of water, businesses, and more.
If you don't specify a feature, all features are selected.

_____________________

elementType (optional) - the property of the specified feature to select.
Elements are sub-parts of a feature, including labels and geometry.
A road, for example, consists of the graphical line (the geometry) on the map,
and also the text denoting its name (a label).
If you don't specify an element, all elements of the feature are selected.

_____________________

stylers - the rules to apply to the selected features and elements.
Stylers indicate the color, visibility, and weight of the feature.
You can apply one or more stylers to a feature.

_____________________

Start Styling Your Map: https://developers.google.com/maps/documentation/javascript/styling#styling_the_default_map
JSON Element Breakdown: https://developers.google.com/maps/documentation/javascript/style-reference
*/

//This function initializes the Google map, and sets what type of features, elements, and styles will be showcased on the map.
      function initMap() {
      "use strict";
      var styles = [ //This site is very helpful for creating this JSON: https://mapstyle.withgoogle.com/
        {
"featureType": "administrative.neighborhood",
"stylers": [
  {
    "visibility": "on"
  }
]
},
{
"featureType": "administrative.province",
"stylers": [
  {
    "visibility": "on"
  }
]
},
{
"featureType": "landscape.man_made",
"stylers": [
  {
    "visibility": "on"
  }
]
},
{
"featureType": "poi.government",
"stylers": [
  {
    "visibility": "on"
  }
]
},
{
"featureType": "poi.medical",
"stylers": [
  {
    "visibility": "on"
  }
]
},
{
"featureType": "poi.medical",
"elementType": "labels.icon",
"stylers": [
  {
    "color": "#ff0000"
  }
]
},
{
"featureType": "road.local",
"stylers": [
  {
    "visibility": "on"
  },
  {
    "weight": 8
  }
]
},
{
"featureType": "transit.station.bus",
"stylers": [
  {
    "visibility": "on"
  }
]
},
{
"featureType": "transit.station.rail",
"stylers": [
  {
    "visibility": "on"
              }
          ]
      }
  ];

      map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 33.447336, lng: -84.146862},  //Sets latitude/logitude coordinates for map to McDonough, GA
          zoom: 16, //This determines how much the map will be zommed in
          styles: styles, //The styles for the map are taken from the styles variable
          mapTypeControl: true //controls whether user can view map in regular or satellite mode
      });
      ko.applyBindings(new AppViewModel());
  }

  String.prototype.contains = function (other) {
      return this.indexOf(other) !== -1;
  };

  //The following is Knockout's View Model
  var AppViewModel = function () {
      var self = this;

      function initialize() {
          fetchServices();
      }

//This allows you to check if Google Maps loaded successfully and add markers accordingly.
      if (typeof google !== 'object' || typeof google.maps !== 'object') {
      } else {
          defaultIcon = makeMarkerIcon('DA70D6'); //This is what the markers on the map will look like before they're clicked on
          highlightedIcon = makeMarkerIcon('FFFF00'); //This is what the markers on the map will look like after they're clicked on
          var infoWindow = new google.maps.InfoWindow(); //Allows an info window to open up w/ more information about the location
          google.maps.event.addDomListener(window, 'load', initialize);
      }


      self.serviceList = ko.observableArray([]);   /*Using an observable array here allows
      us to detect and responsd to any changes that are made to the emergencency services list.*/
      self.query = ko.observable(''); /* Using an observable here allows us to detect and respond
      to any changes that are made to the search box (i.e. what is typed into the search box) */
      self.queryResult = ko.observable(''); /* Using an observable here allows us to detect and respond
      to any changes that are made to the search results (i.e. if you click on one of the search results) */

      self.search = function () { /*Without including this, none of the emergency service options will appear.
          This also prevents the page from reloading when the "Search" button is clicked.
          This will allow the search results to filter instead of the page just reloading.*/
      };

      /*This function controls the list of emergency services that will appear
      after you have typed a location into the search box and hit the "Search" button.*/
      self.FilteredserviceList = ko.computed(function () {
          self.serviceList().forEach(function (service) { /*These two lines state that for each emergency service,
            a marker will be created for that service */
              service.marker.setMap(null);
          });

          var results = ko.utils.arrayFilter(self.serviceList(), function (service) {
              return service.name().toLowerCase().contains(self.query().toLowerCase());
          });

          //This means that for each search result, a marker will be set on the map for that location
          results.forEach(function (service) {
              service.marker.setMap(map);
          });
          if (results.length > 0) {
              if (results.length == 1) {
                //Ex: If there's one result found, it'll say "We've found 1 result for you!"
                  self.queryResult("We've found " + results.length + " result for you! ");
              } else {
                //Ex: If there's ten results found, it'll say "We've found 10 result for you!"
                  self.queryResult("We've found " + results.length + " results for you! ");
              }
          }
          else {
            //Ex: If there are no results found, it'll say "Sorry, we were unable to locate any services!"
              self.queryResult("Sorry, we were unable to locate any services!");
          }
          return results; /*If there's more than 1 result from the search,
          the result will appear once the "Search" button is clicked*/
      });
      //The following message will appear while the search is being loaded
      self.queryResult("We're trying to locate some services for you--give us a moment while we work our magic!");

      //This function sets what will happen when you click on one of the emergency services in the search query list
      self.selectService = function (service) {
          infoWindow.setContent(service.formattedInfoWindowData());
          infoWindow.open(map, service.marker);
          /* If an emergency service is selected, the map will shift so that it displays the location's marker the location's marker. */
          map.panTo(service.marker.position);
          /* If an emergency service is selected, the location's marker will bounce and turn green.*/
          service.marker.setAnimation(google.maps.Animation.BOUNCE);
          service.marker.setIcon(highlightedIcon);
          self.serviceList().forEach(function (unselected_service) {
              if (service != unselected_service) {
                /* If an emergency service is not selected, it will remain still and the marker color will be purple */
                  unselected_service.marker.setAnimation(null);
                  unselected_service.marker.setIcon(defaultIcon);
              }
          });
      };

      /*This function will be used to find emergency services. The FourSquare API will be used for this.
      */
      function fetchServices() {
          var data;
          $.ajax({
              url: 'https://api.foursquare.com/v2/venues/search?ll=33.447336,-84.146862',
              dataType: 'json',
              data: 'client_id=WIWJQN1ECRLLXENM0U0OQ1UBANOQPQYJOY5MOHNIX0NXFZ13&client_secret=GG1C4QEHM1SS4H5ZDBP2NGNNYARWZLGOXOIJWI3C243X23AT&v=20130815%20&ll=33.447336,-84.146862%20&query=hospital,police',
              async: true,
          }).done(function (response) {
              data = response.response.venues;
              data.forEach(function (service) {
                  foursquare = new Foursquare(service, map);
                  self.serviceList.push(foursquare);
              });
              self.serviceList().forEach(function (service) {
                  if (service.map_location()) {
                      google.maps.event.addListener(service.marker, 'click', function () {
                          self.selectService(service);
                      });
                  }
              });
          }).fail(function (response, status, error) {
            //This is the error that will appear if the FourSquare emergency locations cannot be pushed to the site
              $('#query-summary').text('Sorry, we were unable to load any emergency services in your area!');
          });
      }
  };

  //function to make default and highlighted marker icon

  function makeMarkerIcon(markerColor) {
      var markerImage = new google.maps.MarkerImage(
        //New version of this has been released, but older version is still available
         'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
          new google.maps.Size(25, 71), //marker size
          new google.maps.Point(0, 0), //marker origin
          new google.maps.Point(13, 34), //marker anchor
          new google.maps.Size(21, 40)); //marker scaled size
      return markerImage;
  }

  //This is the model for Foursquare's Search for Venues API
  var Foursquare = function (service, map) {
      var self = this;
      self.name = ko.observable(service.name);
      self.location = service.location;
      self.lat = self.location.lat;
      self.lng = self.location.lng;
      self.map_location = ko.computed(function () {
          if (self.lat === 0 || self.lon === 0) {
              return null;
          } else {
              return new google.maps.LatLng(self.lat, self.lng);
          }
      });
      self.formattedAddress = ko.observable(self.location.formattedAddress);
      self.formattedPhone = ko.observable(service.contact.formattedPhone);
      self.marker = (function (service) {
          var marker;

          if (service.map_location()) {
              marker = new google.maps.Marker({
                  position: service.map_location(),
                  map: map,
                  icon: defaultIcon
              });
          }
          return marker;
      })(self);
      self.id = ko.observable(service.id);
      self.url = ko.observable(service.url);
      self.formattedInfoWindowData = function () {
          return '<div class="info-window-content">' + '<a href="' + (self.url()===undefined?'/':self.url()) + '">' +
          //If the emergency service name that was searched for cannot be found, this error will appear.
              '<span class="info-window-header"><h4>' + (self.name()===undefined?'Unfortunately, the service you have searched for is unavailable.':self.name()) + '</h4></span>' +
              //If the emergency service address that was searched for cannot be found, this error will appear.
              '</a><h6>' + (self.formattedAddress()===undefined?'Unfortunately, the address that you have searched for is unavailable.':self.formattedAddress())  + '<br>' + (self.formattedPhone()===undefined?'No Contact Info':self.formattedPhone()) + '</h6>' +
              '</div>';
      };
  };
