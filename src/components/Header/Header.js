import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { logout } from '../../actions'
import { withRouter, Link } from 'react-router-dom'

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

import './Header.css'

class Header extends Component {
  constructor (props) {
    super(props)
    this.state = {
      collapsed: false
    }
  }

  render () {
    const { collapsed } = this.state
    const { dispatch, location, Auth } = this.props
    return (
      <Navbar color='dark' expand='md' dark className='mb-4' sticky='top'>
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
                <NavLink disabled={Auth.guest} tag={Link} to={'/queue'}>
                  <FontAwesomeIcon icon='list' className='d-md-none d-lg-inline-block' />
                  {' '}
                  Queue
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink disabled={Auth.guest} tag={Link} to={'/history'}>
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
                  <DropdownItem tag={Link} to='/categories'>
                    <FontAwesomeIcon icon='list' />
                    {' '}
                    Categories
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
                    {Auth.guest
                      ? <DropdownItem tag={Link} to={{pathname: '/login', state: { prevPath: location.pathname }}}>
                        Login
                      </DropdownItem>
                      : <Fragment>
                        <DropdownItem header>{Auth.username}</DropdownItem>
                        <DropdownItem onClick={() => dispatch(logout())}>
                          Logout
                        </DropdownItem>
                      </Fragment>}
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

export default compose(
  withRouter,
  connect((store) => {
    return {
      Auth: store.Auth
    }
  })
)(Header)
