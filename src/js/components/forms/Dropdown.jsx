/**
 * Created by cmeyers on 11/2/16.
 */
import React, { PropTypes } from 'react';
import FloatingElement from '../FloatingElement';
import DropdownMenuPosition from './DropdownMenuPosition';
import KeyCodes from '../../KeyCodes';

export default class Dropdown extends React.Component {

    constructor(props) {
        super(props);

        this.position = new DropdownMenuPosition();

        this.dropdownRef = null;
        this.buttonRef = null;
        this.menuRef = null;

        this.state = {
            menuOpen: false,
            selectedOption: null,
        };
    }

    componentWillMount() {
        this._defaultSelection(this.props);
    }

    componentDidMount() {
        document.addEventListener('keydown', this._handleKeyEvent);
        document.addEventListener('mousedown', this._handleMouseEvent);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.menuOpen && !prevState.menuOpen) {
            this._setInitialFocus();
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this._handleKeyEvent);
        document.removeEventListener('mousedown', this._handleMouseEvent);
    }

    get selectedOption() {
        return this.state.selectedOption;
    }

    _defaultSelection(props) {
        if (!this.state.selectedOption && props.defaultOption) {
            this.setState({
                selectedOption: props.defaultOption,
            });
        }
    }

    _toggleDropdownMenu() {
        if (this.state.menuOpen) {
            this._closeDropdownMenu();
        } else {
            this._openDropdownMenu();
        }
    }

    _openDropdownMenu() {
        this.setState({
            menuOpen: true,
        });
    }

    _closeDropdownMenu() {
        this.setState({
            menuOpen: false,
        });
    }

    _onDropdownKeyEvent = (event) => {
        console.log('_onDropdownKeyEvent');
        if (event.keyCode === KeyCodes.SPACEBAR) {
            this._toggleDropdownMenu();
            // prevent the onClick handler from being triggered automatically
            event.preventDefault();
        }
    };

    _onDropdownMouseEvent = () => {
        console.log('_onDropdownMouseEvent');
        this._toggleDropdownMenu();
    };

    _handleKeyEvent = (event) => {
        console.log('_handleKeyEvent', this.state.menuOpen);
        if (!this.state.menuOpen) {
            return;
        }

        const { keyCode } = event;

        switch (keyCode) {
            case KeyCodes.TAB:
                // tabbing while open will advance to the next element after this Dropdown
                this._closeDropdownMenu();
                break;
            case KeyCodes.ESC:
                this._closeDropdownMenu();
                break;
            case KeyCodes.ARROW_DOWN:
                event.preventDefault();
                this._changeFocusPosition(1);
                break;
            case KeyCodes.ARROW_UP:
                event.preventDefault();
                this._changeFocusPosition(-1);
                break;
            case KeyCodes.SPACEBAR:
            case KeyCodes.ENTER:
                event.preventDefault();
                this._selectFocusItem();
                break;
            case KeyCodes.PAGE_DOWN:
            case KeyCodes.PAGE_UP:
                console.log('TODO');
                break;
            default:
                break;
        }
    };

    _handleMouseEvent = (event) => {
        console.log("_handleMouseEvent");
        const { clientX, clientY } = event;

        if (this.state.menuOpen) {
            const element = document.elementFromPoint(clientX, clientY);

            if (!this.dropdownRef.contains(element)) {
                this._closeDropdownMenu();
            }
        }
    };

    _setInitialFocus() {
        if (this.state.selectedOption) {
            const selectedIndex = this.props.options.indexOf(this.state.selectedOption);
            const selectedListItem = this.menuRef.children[selectedIndex];
            selectedListItem.children[0].focus();
        } else {
            this._changeFocusPosition(0);
        }
    }

    _changeFocusPosition(position) {
        if ([-1,0,1].indexOf(position) === -1) {
            return;
        }

        if (position === 0 || !this.menuRef.contains(document.activeElement)) {
            const listItem = this.menuRef.children[0];
            const link = listItem.children[0];
            link.focus();
            return;
        }

        const allListItems = [].slice.call(this.menuRef.children);
        const focusedListItem = document.activeElement.parentNode;
        const focusedIndex = allListItems.indexOf(focusedListItem);
        const nextFocusIndex = focusedIndex + position;

        if (0 <= nextFocusIndex && (nextFocusIndex <= allListItems.length - 1)) {
            const nextListItem = allListItems[focusedIndex + position];
            nextListItem.children[0].focus();
        }
    }

    _selectFocusItem() {
        if (this.menuRef.contains(document.activeElement)) {
            const allListItems = [].slice.call(this.menuRef.children);
            const focusedListItem = document.activeElement.parentNode;
            const focusedIndex = allListItems.indexOf(focusedListItem);

            const selectedOption = this.props.options[focusedIndex];
            this.setState({
                selectedOption,
            });

            this._closeDropdownMenu();
        }
    }

    _onMenuItemClick(option, index) {
        this.setState({
            selectedOption: option,
            menuOpen: false,
        });

        if (this.props.onChange) {
            this.props.onChange(option, index);
        }

        return false;
    }

    render() {
        console.log('render', this.state.menuOpen);
        const extraClass = this.props.className || '';
        const openClass = this.state.menuOpen ? 'Dropdown-menu-open' : 'Dropdown-menu-closed';
        const label = this.state.selectedOption || this.props.placeholder;

        return (
            <div ref={dropdown => { this.dropdownRef = dropdown; }}
                className={`Dropdown ${openClass} ${extraClass}`}>
                <button ref={button => { this.buttonRef = button; }}
                   className="Dropdown-button btn-secondary"
                   onClick={this._onDropdownMouseEvent}
                   onKeyUp={this._onDropdownKeyEvent}
                >
                    <div className="Dropdown-button-container">
                        <span className="Dropdown-button-label">{label}</span>
                        <img className="Dropdown-button-indicator" src="foo.png" />
                    </div>
                </button>

                { this.state.menuOpen &&
                <FloatingElement targetElement={this.buttonRef} positionStrategy={this.position}>
                    <ul
                        ref={list => { this.menuRef = list; }}
                        className="Dropdown-menu"
                    >
                        { this.props.options.map((option, index) => {
                            const selectedClass = this.state.selectedOption === option ? 'Dropdown-menu-item-selected' : '';
                            let labelValue = '';

                            if (this.props.labelField) {
                                labelValue = option[this.props.labelField];
                            } else if (this.props.labelFunction) {
                                labelValue = this.props.labelFunction(option);
                            } else {
                                labelValue = option.toString();
                            }

                            return (
                                <li key={index}>
                                    <a className={`Dropdown-menu-item ${selectedClass}`}
                                       href="#"
                                       onClick={() => this._onMenuItemClick(option, index)}
                                    >
                                        {labelValue}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </FloatingElement>
                }
            </div>
        );
    }

}

Dropdown.propTypes = {
    className: PropTypes.string,
    placeholder: PropTypes.string,
    options: PropTypes.array,
    defaultOption: PropTypes.string,
    labelField: PropTypes.string,
    labelFunction: PropTypes.func,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
};

Dropdown.defaultProps = {
    placeholder: '-Select-',
};
