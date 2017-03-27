import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import _last from 'lodash/last';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { addMarker, loadMarkers } from 'redux/modules/mapModule';
import { Spinner, ErrorSnackbar } from '../../components';
import AddLocationDialog from './AddLocationDialog';
import LocationMap from './LocationMap';

const mappedState = ({ map }) => ({
  mapMarkers: map.markers,
  errorMessage: map.error,
  markersLoaded: map.markersLoaded,
  loadingMarkers: map.loadingMarkers,
  addingMarker: map.addingMarker,
  markerAdded: map.markerAdded
});

const mappedActions = {
  addMarker,
  loadMarkers
};

@connect(mappedState, mappedActions)
export default class WorldPage extends Component {
  static propTypes = {
    mapMarkers: PropTypes.array.isRequired,
    errorMessage: PropTypes.string.isRequired,
    markersLoaded: PropTypes.bool.isRequired,
    loadingMarkers: PropTypes.bool.isRequired,
    addingMarker: PropTypes.bool.isRequired,
    markerAdded: PropTypes.bool.isRequired,
    addMarker: PropTypes.func.isRequired,
    loadMarkers: PropTypes.func.isRequired
  }

  state = {
    showAddLocationDialog: false, // Shows popup for adding localization to the map
    mapCenterCoord: [0, 0],
    mapZoomLevel: 3
  }

  componentWillMount() {
    // Fetch markers from API
    if (!this.props.markersLoaded) this.props.loadMarkers();
  }

  componentWillReceiveProps(nextProps) {
    // If we successfully got a new marker, center the map view on it
    if (!this.props.markerAdded && nextProps.markerAdded) {
      const lastMarker = _last(nextProps.mapMarkers);

      this.setState({
        mapZoomLevel: 10,
        mapCenterCoord: [lastMarker.lat, lastMarker.lng]
      });
    }
  }

  openAddLocationDialog = () => {
    this.setState({ showAddLocationDialog: true });
  }

  closeAddLocationDialog = () => {
    this.setState({ showAddLocationDialog: false });
  }

  // Adds new marker to the map and centers the view on it
  // TODO: for now it saves them in components state, eventually they'll be
  // stored in the database
  addMarker = markerData => {
    const lat = markerData.location.geometry.location.lat();
    const lng = markerData.location.geometry.location.lng();

    const newMarker = {
      name: markerData.name,
      link: markerData.link,
      description: markerData.description,
      lat,
      lng
    };

    this.props.addMarker(newMarker);
  }

  render() {
    const { mapMarkers, errorMessage, loadingMarkers, addingMarker } = this.props;
    const { showAddLocationDialog, mapCenterCoord, mapZoomLevel } = this.state;
    const styles = require('./WorldPage.scss');

    if (loadingMarkers || addingMarker) return <Spinner />;

    const AddMarkerButton = (
      <FloatingActionButton
        className={styles.AddMarkerButton}
        onClick={this.openAddLocationDialog}
      >
        <ContentAdd />
      </FloatingActionButton>
    );

    return (
      <div className={styles.WorldPage}>
        {AddMarkerButton}
        <LocationMap
          centerCoords={mapCenterCoord}
          zoomLevel={mapZoomLevel}
          markers={mapMarkers}
        />
        <AddLocationDialog
          popupVisible={showAddLocationDialog}
          closePopup={this.closeAddLocationDialog}
          addMarker={this.addMarker}
        />
        <ErrorSnackbar
          open={errorMessage !== ''}
          message={errorMessage}
        />
      </div>
    );
  }
}
