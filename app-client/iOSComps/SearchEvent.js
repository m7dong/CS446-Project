import React, { Component } from 'react';
//import { Container, Header, Item, Input, Icon, Button, Text } from 'native-base';
import { Container, Content, Button, Text } from 'native-base';
import { Footer, FooterTab, Icon, ListItem, List, Card, CardItem, Left, Body, Thumbnail, Picker} from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';
import {
  AppRegistry,
  StyleSheet,
  //Text,
  View,
  Image,
  TouchableHighlight,
  TextInput,
  ListView
} from 'react-native';
import FBSDK, {LoginManager, LoginButton, AccessToken, GraphRequest, GraphRequestManager} from 'react-native-fbsdk'
import * as firebase from 'firebase';

import EventPage from '../iOSComps/EventPage';

export default class SearchEvent extends Component {
  constructor(props){
    super(props)
    this.state = {
      name : '',
      category: 'All',
      searchEvents: this._createListdataSource([]),
      searchEventIds: [],
      eventsRef : this.props.firebaseApp.database().ref('Events/'),
    }
  }
  
  componentWillMount() {
    this._searchEventsCallBack = this._searchEventsCallBack.bind(this)
    this.state.eventsRef.on('value', this._searchEventsCallBack, function(error) {
      console.error(error);
    });
  }
  
  componentWillUnmount() {
    this.state.eventsRef.off('value', this._searchEventsCallBack);
  }
  
  _onBack() {
    this.props.navigator.pop();
  }
  
  _createListdataSource(array) {
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return ds.cloneWithRows(array)
  }
  
  _searchEventsCallBack(snapshot) {
    var events = []
    var eventIds = []
    var searchName = this.state.name
    var searchCategory = this.state.category
    console.log(searchCategory)
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    snapshot.forEach(function(data) {
      var dataVal = data.val()
      if (searchCategory == 'All') {
        if(searchName == '' && !dataVal.Private) {
          events.push(dataVal)
          eventIds.push(data.key)
        }
        else if (searchName != '' && (dataVal.Name.includes(searchName) || dataVal.Location.includes(searchName)) && !dataVal.Private){
          events.push(dataVal)
          eventIds.push(data.key)
        }      
      }
      else if(searchName == '' && searchCategory.includes(dataVal.Type) && !dataVal.Private) {
          events.push(dataVal)
          eventIds.push(data.key)
      }
      else if ((dataVal.Name.includes(searchName) || dataVal.Location.includes(searchName)) && searchCategory.includes(dataVal.Type) && !dataVal.Private) {
          events.push(dataVal)
          eventIds.push(data.key)
      }
    });
    this.setState({ 
      //searchEvents: this._createListdataSource(events),
      searchEvents: ds.cloneWithRows(events),
      myeventIds: eventIds,
    });
  }
  
  _onSearch() {
    this.state.eventsRef.once('value').then(this._searchEventsCallBack.bind(this))
  }
  
  _onEvent(rowData, rowID) {
    this.props.navigator.push({
      component: EventPage,
      title: rowData,
      passProps: { 
        firebaseApp : this.props.firebaseApp,
        name : this.props.name,
        fbId : this.props.fbId,
        eventId : this.state.myeventIds[rowID]
      }
    });
  }
  
  _renderRow(rowData, sectionID, rowID, highlightRow) {
    console.log(rowData)
    return (
      <TouchableHighlight onPress = {this._onEvent.bind(this, rowData.name, rowID)}>
        <View style={styles.eventCard}>
          <Grid style={{backgroundColor: '#F8F8F8', height: 130}}>
          <Col size={25}>
            <Thumbnail square source={require('../img/blink.jpg')} style={{marginTop: 5, marginLeft: 7}} />
          </Col>
          <Col size={75}>
            <Text style = {{fontSize: 16, marginTop: 7, fontWeight: '400'}} 
            numberOfLines={1}> 
             {rowData.Name} 
           </Text>
           <Text style = {{fontSize: 16, marginTop: 7, fontWeight: '400', color: "grey"}} 
            numberOfLines={1}> 
             {rowData.Date}  {rowData.Location}
           </Text>
          </Col>
          </Grid>
        </View>
      </TouchableHighlight>
    )
  }
  onValueChange (value: string) {
        this.setState({
            category : value
        });
  }

  
  render() {
    return (
      <Content>
        <Grid style={{backgroundColor: '#F8F8F8', marginTop: 80, marginRight: 7}}> 
          <Col size={37} style={{marginTop: 5, marginLeft: 5}}>
            <Picker  iosHeader="Select one"
                 mode="dropdown"
                 style={{backgroundColor: '#157EFB', height: 30, marginLeft: 5}}
                 selectedValue={this.state.category}
                 onValueChange={this.onValueChange.bind(this)}>
                        <Picker.Item label="All   >" value="All" />
                        <Picker.Item label="Food   >" value="Food" />
                        <Picker.Item label="Drinks   >" value="Drinks" />
                        <Picker.Item label="Nightlife   >" value="Nightlife" />
                        <Picker.Item label="Movies   >" value="Movies" />
                        <Picker.Item label="Sports   >" value="Sports" />
                        <Picker.Item label="Casino   >" value="Casino" />
                        <Picker.Item label="Others   >" value="Others" />
            </Picker>      
          </Col>
          <Col size={63} style={{marginTop: 5, marginLeft: 4}}>
            <TextInput style={styles.textinput} placeholder=" Search for event, city"
                        onChangeText={(text) => this.setState({name : text})} />
          </Col>
        </Grid>

        <Button full iconRight onPress = {this._onSearch.bind(this)} style={{marginTop: 8, marginLeft:7, marginRight:5, height: 30}}>
            <Text>Search </Text></Button>  

        <View style={styles.container2}>
          <ListView 
            dataSource={this.state.searchEvents}
            renderRow={this._renderRow.bind(this)}
            enableEmptySections={true}
            automaticallyAdjustContentInsets={false} />
        </View>
        
         
      </Content>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: null,
    height: null,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom:10,
  },
  container1: {
    flex: 2,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  textinput: {
    height: 30,
    fontSize: 20,
    paddingHorizontal: 0,
    borderColor: 'gray', 
    borderWidth: 1,
    backgroundColor: '#F7F7F7'
  },
  container2: {
    flex: 3,
  },
  eventCard: {
    marginLeft: 5,
    marginRight: 5,
    marginTop: 7,
    height: 80,
    backgroundColor: '#F8F8F8',
    padding: 5,
    shadowColor: '#8E8E93',
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowRadius: 5,
    shadowOpacity: 1.0,
  },
  text: {
    color: '#fffff0',
    fontSize: 40,
    fontWeight: '600',
    backgroundColor: 'transparent',
    marginTop: 7
  },
});

AppRegistry.registerComponent('SearchEvent', () => SearchEvent);
