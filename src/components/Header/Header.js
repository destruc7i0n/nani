import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { logout } from '../../actions'

import {
  Collapse,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
  UncontrolledButtonDropdown,
  UncontrolledDropdown
} from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import SearchInput from './SearchInput'
import Options from './Options'

class Header extends Component {
  constructor (props) {
    super(props)
    this.state = {
      collapsed: false
    }
  }

  render () {
    const { collapsed } = this.state
    const { dispatch, Auth } = this.props
    return (
      <Navbar color='dark' expand='md' dark className='mb-4' sticky='top' style={
        // a little polyfill to make the top be under the navigation bar on ios etc.
        window.navigator.standalone
          ? {paddingTop: '15pt'}
          : {}
      }>
        <Container>
          <NavbarBrand tag={Link} to='/'>
            <div className='logo d-md-none d-lg-inline-block' style={{ width: '2rem', height: '2rem' }} />
            {' '}
            nani?!
          </NavbarBrand>
          <NavbarToggler onClick={() => this.setState({ collapsed: !collapsed })} />
          <Collapse isOpen={collapsed} navbar>
            <Nav className='mr-auto' navbar>
              <NavItem>
                <NavLink tag={Link} to='/queue'>
                  <FontAwesomeIcon icon='list' className='d-md-none d-lg-inline-block' />
                  {' '}
                  Queue
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to='/history'>
                  <FontAwesomeIcon icon='history' className='d-md-none d-lg-inline-block' />
                  {' '}
                  History
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to='/recent'>
                  <FontAwesomeIcon icon='clock' className='d-md-none d-lg-inline-block' />
                  {' '}
                  Recent
                </NavLink>
              </NavItem>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  <FontAwesomeIcon icon='step-forward' className='d-md-none d-lg-inline-block' />
                  {' '}
                  Series List
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem tag={Link} to='/list/simulcast'>
                    <FontAwesomeIcon icon='closed-captioning' />
                    {' '}
                    Simulcasts
                  </DropdownItem>
                  <DropdownItem tag={Link} to='/list/popular'>
                    <FontAwesomeIcon icon='certificate' />
                    {' '}
                    Popular Anime
                  </DropdownItem>
                  <DropdownItem tag={Link} to='/list/newest'>
                    <FontAwesomeIcon icon='calendar-alt' />
                    {' '}
                    Newest Anime
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
            <Nav className='ml-auto' navbar>
              <NavItem className='dropdown'>
                <SearchInput />
              </NavItem>
              <NavItem className='mt-2 mt-md-0'>
                <UncontrolledButtonDropdown inNavbar className='w-100'>
                  <DropdownToggle caret className='ml-md-2 mr-md-2 w-100'>
                    <FontAwesomeIcon icon='user' />
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem header>{Auth.username}</DropdownItem>
                    <DropdownItem onClick={() => dispatch(logout())}>
                      Logout
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledButtonDropdown>
              </NavItem>
              <NavItem className='mt-2 mt-md-0'>
                <Options />
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    )
  }
}

export default connect((store) => {
  return {
    Auth: store.Auth
  }
})(Header)
