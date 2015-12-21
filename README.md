# Seattle-Transit-Data
Visualization of some traffic data in the city of Seattle

Data comes from [Seattle City API](https://data.seattle.gov/). I used transit data for this project. There are two
different types of data polled.
1. Traffic density
2. Bike Racks

## Traffic Density
Traffic density comes from a polling of traffic flow counts. The provided data consists of address and an average anual
week day tally (AAWDT). Each address is mapped to a geographical location (latitude, longitude). From there a heat map is
generated. Each point has a weight of the AAWDT. The weights are smoothed using exponential smoothing. The data is
passed through Google maps API. The API provides a quick way of translating real world map data into a visual form.
Current traffic conditions cal be mapped as well.

## Bike Racks
The City of Seattle keeps a data set of bike racks. This mapped from geographical addresses into map locations. Becuase
of the density of bike racks in the city, not all bike racks should be displayed at once. A set number can be displayed
through the user interface. Bike racks are displayed pseudo randomly throughout the map.

### Nearest Bike Rack
Given an address (geographical or postal address), a nearest bike rack can be approximated. Because there are currently
~1000 bike racks, the absolute nearest bike rack cannot be found in a timely manner. The Google maps API has a polling
rate limit along with query limits. Instead of waiting to look up all the bike racks and use up more querys, a sampling
of bike racks are used. Currently only 100 bikes are used per query. Bike racks are queried randomly, so results may
vary for every request.

## Errors
The application requires access to Google products, such as Google maps. If there is a problem attempting to access any
of the external dependencies, try turning off (white list or turn off completly) any add blocking and cookie trackers.
If there is a problem with any of the data sources from Seattle's API, the UI will prevent a user from trying to make
any requests.

Any run time errors with requesting data or parsing will generate an error message for the user. The user should wait
for several moments incase of going over a query limit.
