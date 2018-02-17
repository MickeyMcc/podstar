import React from 'react';
import SearchEntry from './SearchEntry.jsx';
import { PaneStyle, ButtonStyle, InputStyle } from '../styles.jsx';

class SearchList extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      searchQuery: ''
    }
  }

  handleChange(event) {
    this.setState({ searchQuery: event.target.value });
  }

  handleSubmit(event) {
    if (this.state.searchQuery !== '') {
      this.props.search(this.state.searchQuery);
    }
  }
  
  render () {
    return (
      <div style = {PaneStyle} >
        <div>
          <input style = {InputStyle} type='text' value = {this.state.searchQuery} onChange = {this.handleChange.bind(this)}/>
          <button style = {ButtonStyle} onClick = {this.handleSubmit.bind(this)}> Search! </button>
        </div>
        <h4> Search Results </h4>
        {this.props.results.length} results found.
        {this.props.results.map((result, index) =>
          <SearchEntry show={result}
            key={index}
            addShow = {this.props.addShow}
          />
        )}
      </div>
    )
    
  }
}

export default SearchList;

