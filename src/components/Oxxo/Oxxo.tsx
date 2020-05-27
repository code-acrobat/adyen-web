import { h } from 'preact';
import UIElement from '../UIElement';
import OxxoVoucherResult from './components/OxxoVoucherResult';
import CoreProvider from '~/core/Context/CoreProvider';
import withPayButton from '../helpers/withPayButton';

export class OxxoElement extends UIElement {
    public static type = 'oxxo';

    get isValid() {
        return true;
    }

    formatProps(props) {
        return {
            ...props,
            name: 'Oxxo'
        };
    }

    /**
     * @private
     * Formats the component data output
     * @return {object} props
     */
    formatData() {
        return {
            paymentMethod: {
                type: this.props.type || OxxoElement.type
            }
        };
    }

    private handleRef = ref => {
        this.componentRef = ref;
    };

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                {this.props.reference ? (
                    <OxxoVoucherResult ref={this.handleRef} {...this.props} />
                ) : (
                    this.payButton({
                        ...this.props,
                        classNameModifiers: ['standalone'],
                        label: `${this.props.i18n.get('continueTo')} ${this.props.name}`,
                        onClick: this.submit
                    })
                )}
            </CoreProvider>
        );
    }
}

export default withPayButton(OxxoElement);