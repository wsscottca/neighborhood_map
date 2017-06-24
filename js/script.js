// Declare global variables
var map;

// Initial settings
var CLIENT_ID = "INSERT_CLIENT_ID_HERE";
var CLIENT_SECRET = "INSERT_CLIENT_SECRET_HERE";
var initialLocations = [
  {
    name : 'Downtown Roseville',
    lat: 38.7521,
    lng: -121.2880
  },

  {
    name: 'Sunsplash', 
    lat: 38.7615,
    lng: -121.2574
  },

  {
    name: 'Galleria',
    lat: 38.7735,
    lng: -121.2692
  },

  {
    name: 'Dave and Busters',
    lat: 38.7683,
    lng: -121.2701
  },

  {
    name: 'William Bill Hughes Park',
    lat: 38.8010,
    lng: -121.3349
  }
];

// function search filters places/markers by self.search
function Location(data) {
  var self = this;

  this.init = true;
  this.error = "";

  this.name = data.name;
  this.lat = data.lat;
  this.lng = data.lng;

  this.address = "";
  this.phone = "";

  this.visible = ko.observable(true);

  $.getJSON("https://api.foursquare.com/v2/venues/search?"+
            "client_id="+CLIENT_ID +
            "&client_secret="+CLIENT_SECRET +
            "&v="+(new Date()).toISOString().slice(0,10).replace(/-/g,"") +
            "&ll="+data.lat+","+data.lng +
            "&limit=1").done(function(data){
              var response = data.response.venues[0];
              console.log(response);
              self.address = response.location.formattedAddress[0] + ", " +
                            response.location.formattedAddress[1] + " ";
              console.log(self.address);
              if (typeof self.phone != 'undefined') {
                self.phone = response.contact.formattedPhone;
              }
  }).fail(function() {
    this.name = data.name;
    this.error = "There was an error with the Foursquare API call. Check internet connection and try again.";
  });

    this.contentString = '<div>'+
                         '<h4>'+self.name+'</h4>'+
                         '<span>'+self.address+'</span>'+
                         '<span>'+self.phone+'</span>'+
                         '</div>';

  this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

  this.marker = new google.maps.Marker({
    position: new google.maps.LatLng(data.lat, data.lng),
    map: map,
    title: data.name
  });

  this.marker.addListener('click', function(){
    self.contentString = '<div>'+
                         '<h4>'+self.name+'</h4>'+
                         '<span>'+self.address+'</span><br>'+
                         '<span>'+self.phone+'</span>'+
                         '</div>';
    self.infoWindow.setContent(self.contentString);
    self.infoWindow.open(map, this);
  });

  this.isVisible = ko.computed(function() {
    if(self.visible() === true) {
      self.marker.setMap(map);
    } else {
      self.marker.setMap(null);
    }
  }, this);

  // TODO: Fix Toggle marker visibility from list
  /*this.setVisibility = ko.computed(function() {
    if(self.init == false){
      if(self.visible() === true) {
        self.visible(false);
      } else {
        self.visible(true);
      }
    } else {
      self.init == false;
    }
  }, this);*/
}

function ViewModel() {
  var self = this;

  this.search = ko.observable("");
  this.locations = ko.observableArray([]);

  var mapOptions = {
    center: {lat: 38.7615, lng: -121.2701},
    zoom: 14,
    mapTypeControl: false
  };

  // Constructor creates new map and inserts it into the div with the id of map
  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  initialLocations.forEach(function(location){
    self.locations.push(new Location(location));
  });

  this.filteredList = ko.computed(function(){
    // Make lower case to make finding a match easier
    search = self.search().toLowerCase();
    if (!search){
      // If there is no self.search include all places
      self.locations().forEach(function(location){
        location.visible(true);
      });
      return self.locations();
    } else {
      // Otherwise only include places that match/contain the search (if any)
      return ko.utils.arrayFilter(self.locations(), function(location) {
        var string = location.name.toLowerCase();
        var result = (string.search(search) >= 0);
        location.visible(result);
        return result;
      });
    }
  }, self);
}

function app(){
  setTimeout(function(){
    ko.applyBindings(new ViewModel());
  }, 200);
}
