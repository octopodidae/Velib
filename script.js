const vm = new Vue({
  el: "#app",
  data: {
    url:
      "https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&q=&rows=1500&sort=name&facet=name&facet=is_installed&facet=is_renting&facet=is_returning&facet=nom_arrondissement_communes",
    stations: [],
    map: null,
    view: null,
    graphicLayer: null,
    featureLayer: null,
    layerView: null,
    clusterConfig: {
      type: "cluster",
      clusterRadius: "100px",
      popupTemplate: {
        content: "Ce cluster représente {cluster_count} stations.",
        fieldInfos: [
          {
            fieldName: "cluster_count",
            format: {
              places: 0,
              digitSeparator: true
            }
          }
        ]
      },
      clusterMinSize: "24px",
      clusterMaxSize: "60px",
      labelingInfo: [
        {
          deconflictionStrategy: "none",
          labelExpressionInfo: {
            expression: "Text($feature.cluster_count, '#,###')"
          },
          symbol: {
            type: "text",
            color: "#004a5d",
            font: {
              weight: "bold",
              family: "Noto Sans",
              size: "12px"
            }
          },
          labelPlacement: "center-center"
        }
      ]
    },
    renderer: {
      type: "simple",
      field: "Name",
      symbol: {
        type: "simple-marker",
        size: "8px",
        color: "#fbbd08",
        outline: {
          color: "rgba(255, 0, 0, 0.5)",
          width: 5
        }
      }
    },
    highlightOptions: {
      color: [255, 241, 58],
      fillOpacity: 0.4
    },
    highlightSelect: null,
    searchString: "",
    btnsStation: null,
    jqStationsInExtent: null,
    cleanSearch: null,
    isActive: false,
    cssArcgisJs: null,
    menuPanel: null,
    legendDiv: null,
    lightNight: null,
    btnsSecondary: null,
    inputToogle: null,
    inputToogle2: null,
    hover: false,
    bikesavailable: null,
    capacity: null,
    mechanical: null,
    ebike: null,
    dock: null,
    myWidgets: null,
    legendText: null,
    dimmer: null,
    divNoResult: null,
    divNoResultTxt: null,
    i: 0
    // stationsLen: null,
    // timeLoad: 0,
    // mySetInterval: null,
  },
  mounted() {
    require([
      "esri/Map",
      "esri/views/MapView",
      "esri/request",
      "esri/layers/FeatureLayer",
      "esri/Graphic",
      "esri/layers/GraphicsLayer",
      "esri/core/watchUtils",
      "esri/widgets/Search",
      "esri/widgets/Home"
    ], function (
      Map,
      MapView,
      esriRequest,
      FeatureLayer,
      Graphic,
      GraphicsLayer,
      watchUtils,
      Search,
      Home
    ) {
      $(document).ready(function () {
        //console.log("vm.url", vm.url)
        const graphicLayer = new GraphicsLayer();
        const featureLayer = new FeatureLayer();
        const graphics = [];
        const map = new Map({
          basemap: "streets-night-vector"
        });
        const view = new MapView({
          container: "viewDiv",
          map: map,
          zoom: 11,
          center: [2.3507067561130666, 48.85537812133168],
          constraints: {
            minZoom: 11
          },
          highlightOptions: vm.highlightOptions
        });
        view.ui.remove("attribution");
        view.ui.move("zoom", "top-right");
        const homeButton = new Home({
          view: view,
          container: homeWidget
        });
        const searchWidget = new Search({
          view: view,
          container: "searchWidget"
        });
        // init jQuery var
        vm.cleanSearch = $(
          "#myWidgets > div:nth-child(1) > div > div > button"
        );
        vm.cleanSearch.css("display", "none");
        vm.graphicLayer = graphicLayer;
        vm.featureLayer = featureLayer;
        vm.jqStationsInExtent = [];
        vm.view = view;
        vm.map = map;
        vm.cssArcgisJs = $("link")[4];
        vm.menuPanel = $(".menuPanel");
        vm.myWidgets = $("#myWidgets");
        vm.legendText = $(".Rtable-cell");
        vm.dimmer = $(".dimmer");
        vm.divNoResult = $("#divNoResult");
        vm.divNoResultTxt = $(
          "#divNoResult > div > div.esri-search__warning-text"
        );

        esriRequest(vm.url, {
          responseType: "json"
        }).then(function (response) {
          vm.stations = response.data.records;
          //console.log("vm.stations", vm.stations)
          // console.log("vm.stations.length", vm.stations.length);
          // vm.stationsLen = vm.stations.length;
          // vm.dimmer.removeClass("active");
          vm.stations.forEach(function (station) {
            //console.log(station);
            let point = {
              type: "point",
              longitude: station.geometry.coordinates[0],
              latitude: station.geometry.coordinates[1]
            };
            //console.log(station.fields)
            let attr = {
              Name: station.fields.name,
              Capacity: station.fields.capacity,
              Ebike: station.fields.ebike,
              Mechanical: station.fields.mechanical,
              Numbikesavailable: station.fields.numbikesavailable,
              Numdocksavailable: station.fields.numdocksavailable,
              Stationcode: station.fields.stationcode
            };
            let graphic = new Graphic({
              geometry: point,
              symbol: {
                type: "simple-marker",
                color: [226, 119, 40]
              },
              attributes: attr
            });
            graphics.push(graphic);
          });
          vm.featureLayer.objectIdField = "ObjectID";
          vm.featureLayer.source = graphics;
          vm.featureLayer.renderer = vm.renderer;
          vm.featureLayer.fields = [
            {
              name: "ObjectID",
              alias: "ObjectID",
              type: "oid"
            },
            {
              name: "Stationcode",
              alias: "Stationcode",
              type: "string"
            },
            {
              name: "Name",
              alias: "Name",
              type: "string"
            },
            {
              name: "Capacity",
              alias: "Capacity",
              type: "integer"
            },
            {
              name: "Ebike",
              alias: "Ebike",
              type: "integer"
            },
            {
              name: "Mechanical",
              alias: "Mechanical",
              type: "integer"
            },
            {
              name: "Numbikesavailable",
              alias: "Numbikesavailable",
              type: "integer"
            },
            {
              name: "Numdocksavailable",
              alias: "Numdocksavailable",
              type: "integer"
            }
          ];
          vm.featureLayer.outFields = ["*"];
          vm.featureLayer.popupTemplate = {
            title: "{Name}",
            content:
              '<span class="ui violet circular label" style="margin-right: 20px;">{Capacity}</span><span class="ui purple circular label" style="margin-right: 20px; margin-bottom: 20px;">{Numbikesavailable}</span><br><span class="ui green circular label" style="margin-right: 20px;">{Mechanical}</span><span class="ui teal circular label" style="margin-right: 20px;">{Ebike}</span><span class="ui blue circular label" style="margin-right: 20px;">{Numdocksavailable}</span>'
          };
          vm.view.popup.dockOptions = {
            buttonEnabled: true,
            breakpoint: {
              width: 600,
              height: 1000
            },
            position: "bottom-left"
          };
          vm.featureLayer.featureReduction = vm.clusterConfig;
          map.add(vm.featureLayer);
          view.when(function () {
            // watchUtils.whenTrue(view, "stationary", function() {
            //   console.log(view);
            // })
            view
              .whenLayerView(featureLayer)
              .then((layerView) => {
                vm.layerView = layerView;
                vm.btnsStation = $(".btn-station");
                // console.log("vm.btnsStation", vm.btnsStation);
                vm.filterStationByExtent();
                vm.legendDiv = $("#legendDiv_controls_content");
                vm.lightNight = $(".lightNight");
                vm.btnsSecondary = $(".secondary");
                vm.inputToogle = $(
                  "input[type='checkbox'] + .pure-toggle [class^='basemap-'], input[type='checkbox'] + .pure-toggle [class*='basemap-']"
                );
                vm.inputToogle2 = $(
                  "input[type='checkbox']:checked + .pure-toggle [class^='basemap-'], input[type='checkbox']:checked + .pure-toggle [class*='basemap-']"
                );
              })
              .catch(function (error) {
                console.log(error);
              });
          });
        });

        vm.removeHighligt();
        vm.disableClustering();
      });
    });
  },
  methods: {
    searchByName: function () {
      vm.searchString = vm.searchString.toLowerCase();
      if (vm.searchString.length > 2) {
        if (vm.jqStationsInExtent.length > 0) {
          vm.i = 0;
          vm.jqStationsInExtent.each(function () {
            if (!$(this).text().toLowerCase().includes(vm.searchString)) {
              vm.i += 1;
              $(this).css("display", "none");
            }
          });
        }
        if (vm.i === vm.jqStationsInExtent.length) {
          // console.log("Aucun résultat !");
          vm.divNoResult.css("display", "inline-block");
          vm.divNoResultTxt.text(
            'Aucun résultat trouvé pour "' +
              vm.searchString +
              "\" dans l'étendue courante."
          );
          vm.jqStationsInExtent.css("display", "inline-block");
        }
      } else {
        vm.divNoResult.css("display", "inline-block");
        vm.divNoResultTxt.text("Veuillez saisir au moins 3 caractères");
      }
    },
    resetSearch: function () {
      if (vm.searchString.length > 2) {
        vm.divNoResult.css("display", "none");
      }
      if (vm.searchString === "") {
        vm.divNoResult.css("display", "none");
        if (vm.jqStationsInExtent.length > 0) {
          vm.jqStationsInExtent.css("display", "inline-block");
        }
      }
    },
    displayCleanSearch: function () {
      if (vm.searchString.length > 2) {
        vm.cleanSearch.css("display", "flex");
      } else {
        vm.cleanSearch.css("display", "none");
      }
    },
    cleanSearchFct: function () {
      vm.searchString = "";
      vm.resetSearch();
      vm.cleanSearch.css("display", "none");
    },
    zoomToStationAndHighlight: function (Stationcode) {
      let query = vm.featureLayer.createQuery();
      query.where = "Stationcode=" + "'" + Stationcode + "'";
      query.returnGeometry = true;
      query.outFields = ["*"];
      vm.featureLayer.queryFeatures(query).then(function (result) {
        if (vm.highlightSelect) {
          vm.highlightSelect.remove();
        }
        let feature = result.features[0];
        //console.log("feature", feature);
        vm.highlightSelect = vm.layerView.highlight(
          feature.attributes["Stationcode"]
        );
        vm.view.goTo(
          {
            target: [feature.geometry.longitude, feature.geometry.latitude],
            zoom: 16
          },
          {
            animate: true,
            duration: 1000,
            easing: "ease"
          }
        );
        vm.view.popup.open({
          features: result.features,
          location: [feature.geometry.longitude, feature.geometry.latitude]
        });
      });
    },
    removeHighligt: function () {
      vm.view.popup.watch("selectedFeature", function (e) {
        //console.log("vm.view.popup", vm.view.popup);
        if (vm.highlightSelect) {
          vm.highlightSelect.remove();
        }
      });
    },
    disableClustering: function () {
      vm.view.watch("zoom", function (zoom) {
        if (vm.view.zoom >= 16) {
          vm.featureLayer.featureReduction = null;
        } else {
          vm.featureLayer.featureReduction = vm.clusterConfig;
        }
      });
    },
    filterStationByExtent: function () {
      vm.layerView.watch("updating", function (val) {
        if (!val) {
          console.log("filterStationByExtent");
          vm.dimmer.addClass("active");
          vm.searchString = "";
          vm.cleanSearch.css("display", "none");
          let stationsInExtent = [];
          let lenStationsInExtent = 0;
          let query = vm.featureLayer.createQuery();
          query.geometry = vm.view.extent;
          // console.log("vm.view.extent", vm.view.extent);
          query.spatialRelationship = "intersects";
          vm.layerView.queryFeatures(query).then(function (results) {
            for (let i = 0; i < results.features.length; i++) {
              let stationName = results.features[i].attributes.Name;
              stationName = stationName.toLowerCase();
              // console.log("stationName", stationName);
              stationsInExtent.push(stationName);
            }
            // console.log("stationsInExtent", stationsInExtent);
            lenStationsInExtent = stationsInExtent.length;
            // console.log("lenStationsInExtent", lenStationsInExtent);
            vm.jqStationsInExtent = $();

            vm.btnsStation.each(function (index, element) {
              if (
                jQuery.inArray(
                  $(this).text().toLowerCase(),
                  stationsInExtent
                ) === -1
              ) {
                $(this).css("display", "none");
              } else {
                $(this).css("display", "inline-block");
                vm.jqStationsInExtent = vm.jqStationsInExtent.add($(this));
              }
            });
            vm.dimmer.removeClass("active");
            // console.log("lenStationsInExtent", lenStationsInExtent);
            // console.log("vm.jqStationsInExtent.length", vm.jqStationsInExtent.length);
          });
        }
      });
    },
    toogleBasemap: function () {
      vm.isActive = !vm.isActive;
      if (vm.isActive) {
        vm.map.basemap = "streets-navigation-vector";
        vm.cssArcgisJs.href =
          "https://js.arcgis.com/4.18/esri/themes/light/main.css";
        vm.menuPanel.css("background-color", "white");
        vm.lightNight.css("background-color", "white");
        vm.myWidgets.css("background-color", "white");
        vm.btnsSecondary.removeClass("secondary");
        vm.inputToogle.css("color", "#6e6e6e");
        vm.inputToogle2.css("color", "#6e6e6e");
        vm.legendText.css("color", "rgba(0,0,0,.8)");
        vm.divNoResult.css("background-color", "#fff");
      } else {
        vm.map.basemap = "streets-night-vector";
        vm.cssArcgisJs.href =
          "https://js.arcgis.com/4.18/esri/themes/dark-blue/main.css";
        vm.menuPanel.css("background-color", "rgba(0, 0, 0, 0.9)");
        vm.lightNight.css("background-color", "#242424");
        vm.myWidgets.css("background-color", "#242424");
        vm.btnsSecondary.addClass("secondary");
        vm.inputToogle.css("color", "#69dcff");
        vm.inputToogle2.css("color", "#69dcff");
        vm.legendText.css("color", "white");
        vm.divNoResult.css("background-color", "#242424");
      }
    },
    hoverBtn: function (event) {
      let btnHovered = $(event.target);
      vm.mechanical = btnHovered.attr("data-mechanical");
      vm.ebike = btnHovered.attr("data-ebike");
      vm.dock = btnHovered.attr("data-dock");
      vm.bikesavailable = btnHovered.attr("data-bikesavailable");
      vm.capacity = btnHovered.attr("data-capacity");
    },
    leaveBtn: function () {
      vm.mechanical = null;
      vm.ebike = null;
      vm.dock = null;
      vm.bikesavailable = null;
      vm.capacity = null;
    }
  }
});
