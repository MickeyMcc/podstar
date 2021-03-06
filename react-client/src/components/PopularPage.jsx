
import React from 'react';
import axios from 'axios';
import _ from 'lodash';

class PopularPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      users: {},
      shows: {},
      usersSort: 'connections',
      showsSort: 'connections',
    };
    this.sortShows = this.sortShows.bind(this);
    this.sortUsers = this.sortUsers.bind(this);
  }

  componentDidMount() {
    this.getInfo('users');
    this.getInfo('shows');
  }

  getInfo(entity) { // entity = 'shows' or 'users'
    const context = this;
    axios({
      method: 'get',
      url: '/activity',
      params: {
        type: entity,
      },
    })
      .then((results) => {
        if (entity === 'users') {
          context.setState({ users: results.data });
        } else {
          context.setState({ shows: results.data });
        }
      })
      .catch((err) => {
        console.log('err', err);
      });
  }

  sortUsers(type) {
    this.setState({ usersSort: type });
  }

  sortShows(type) {
    this.setState({ showsSort: type });
  }

  render() {
    return (
      <div>
        <div>
          <h4>Top Users</h4>
          <h5> Sort by :
            <a onClick={() => this.sortUsers('adds')}> Adds </a>
            <a onClick={() => this.sortUsers('comments')}>| Comments </a>
          </h5>
          {this.renderEntry(this.state.users, this.state.usersSort)}
        </div>
        <div>
          <h4>Top Shows</h4>
          <h5> Sort by :
            <a onClick={() => this.sortShows('adds')}> Adds </a>
            <a onClick={() => this.sortShows('comments')}>| Comments </a>
          </h5>
          {this.renderEntry(this.state.shows, this.state.showsSort)}
        </div>
      </div>
    );
  }
}

export default PopularPage;
