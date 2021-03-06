import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _last from 'lodash/last';
// STORE
import { loadMarkers, removeMarker, addMarker } from 'redux/modules/mapModule';
import { showError } from 'redux/modules/errorsModule';
// COMPONENTS
import { LoadingScreen, Map } from 'components';
import AddLocationDialog from './AddLocationDialog';
// LAYOUT
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import styles from './WorldPage.scss';

const mappedState = ({ map, auth }) => ({
  mapMarkers: map.markers,
  markersLoaded: map.markersLoaded,
  loadingMarkers: map.loadingMarkers,
  addingMarker: map.addingMarker,
  markerAdded: map.markerAdded,
  removingMarker: map.removingMarker,
  loggedIn: auth.loggedIn
});

const mappedActions = {
  loadMarkers,
  addMarker,
  removeMarker,
  showError
};

@connect(mappedState, mappedActions)
export default class WorldPage extends Component {
  static propTypes = {
    mapMarkers: PropTypes.array.isRequired,
    markersLoaded: PropTypes.bool.isRequired,
    loadingMarkers: PropTypes.bool.isRequired,
    addingMarker: PropTypes.bool.isRequired,
    markerAdded: PropTypes.bool.isRequired,
    removingMarker: PropTypes.number,
    loadMarkers: PropTypes.func.isRequired,
    addMarker: PropTypes.func.isRequired,
    removeMarker: PropTypes.func.isRequired,
    showError: PropTypes.func.isRequired,
    loggedIn: PropTypes.bool.isRequired
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
    if (!this.props.loggedIn) return this.props.showError({ requestName: 'Pin yourself', error: new Error('Should authorizated') });
    this.setState({ showAddLocationDialog: true });
  }

  closeAddLocationDialog = () => {
    this.setState({ showAddLocationDialog: false });
  }

  // Adds new marker to the map and centers the view on it
  addMarker = markerData => {
    if (!this.props.loggedIn) return;
    const newMarker = {
      name: markerData.name,
      link: markerData.link,
      description: markerData.description,
      lat: markerData.location.geometry.location.lat(),
      lng: markerData.location.geometry.location.lng(),
      googleLocationId: markerData.location.place_id
    };

    this.props.addMarker(newMarker);
  }

  removeMarker = markerId => {
    if (!this.props.loggedIn) return;
    this.props.removeMarker(markerId);
  }

  render() {
    const { mapMarkers, loadingMarkers, addingMarker, markerAdded, removingMarker, loggedIn } = this.props;
    const { showAddLocationDialog, mapCenterCoord, mapZoomLevel } = this.state;

    return (
      <LoadingScreen loading={loadingMarkers}>
        <div className={styles.WorldPage}>
          <FloatingActionButton
            className={styles.AddMarkerButton}
            onClick={this.openAddLocationDialog} >
            <ContentAdd />
          </FloatingActionButton>
          <Map
            type="users"
            centerCoords={mapCenterCoord}
            zoomLevel={mapZoomLevel}
            markers={mapMarkers}
            removeMarker={this.removeMarker}
            removingMarker={removingMarker}
            loggedIn={loggedIn}
          />
          <AddLocationDialog
            popupVisible={showAddLocationDialog}
            closePopup={this.closeAddLocationDialog}
            addMarker={this.addMarker}
            addingMarker={addingMarker}
            markerAdded={markerAdded}
          />
        </div>
      </LoadingScreen>
    );
  }
}
