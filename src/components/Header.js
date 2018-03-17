import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { logout } from '../actions'

import {
  Collapse,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
  UncontrolledDropdown
} from 'reactstrap'

import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import { faHistory, faList, faUser, faStepForward, faClosedCaptioning, faCertificate } from '@fortawesome/fontawesome-free-solid'

import SearchInput from './SearchInput'

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
      <Navbar color='dark' expand='md' dark className='mb-4' sticky='top'>
        <Container>
          <NavbarBrand tag={Link} to='/'>
            nani?!
          </NavbarBrand>
          <NavbarToggler onClick={() => this.setState({ collapsed: !collapsed })} />
          <Collapse isOpen={collapsed} navbar>
            <Nav className='mr-auto' navbar>
              <NavItem>
                <NavLink tag={Link} to='/queue'>
                  <FontAwesomeIcon icon={faList} />
                  &nbsp;
                  Queue
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to='/history'>
                  <FontAwesomeIcon icon={faHistory} />
                  &nbsp;
                  History
                </NavLink>
              </NavItem>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  <FontAwesomeIcon icon={faStepForward} />
                  &nbsp;
                  Series List
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem tag={Link} to='/list/simulcast'>
                    <FontAwesomeIcon icon={faClosedCaptioning} />
                    &nbsp;
                    Simulcasts
                  </DropdownItem>
                  <DropdownItem tag={Link} to='/list/popular'>
                    <FontAwesomeIcon icon={faCertificate} />
                    &nbsp;
                    Popular
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
            <Form className='d-inline'>
              <SearchInput />
            </Form>
            <UncontrolledDropdown>
              <DropdownToggle caret className='ml-md-2 w-100'>
                <FontAwesomeIcon icon={faUser} />
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem header>{Auth.username}</DropdownItem>
                <DropdownItem onClick={() => dispatch(logout())}>
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
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
