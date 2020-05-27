import Language from '../language';
import UIElement from '../components/UIElement';
import RiskModule from './RiskModule';
import paymentMethods, { getComponentConfiguration } from '../components';
import PaymentMethodsResponse from './ProcessResponse/PaymentMethodsResponse';
import getComponentForAction from './ProcessResponse/PaymentAction';
import resolveEnvironment from './Environment';
import { version } from '../../package.json';
import Analytics from './Analytics';
import { PaymentAction } from '~/types';

class Core {
    private paymentMethodsResponse: PaymentMethodsResponse;
    public readonly modules: any;
    public readonly options: any;

    public static readonly version: string = version;

    constructor(options: any = {}) {
        this.options = {
            ...options,
            loadingContext: resolveEnvironment(options.environment)
        };

        this.modules = {
            risk: new RiskModule(this.options),
            analytics: new Analytics(this.options),
            i18n: new Language(options.locale, options.translations)
        };

        this.paymentMethodsResponse = new PaymentMethodsResponse(options.paymentMethodsResponse, options);

        this.create = this.create.bind(this);
        this.createFromAction = this.createFromAction.bind(this);
    }

    /**
     * Instantiates a new UIElement component ready to be mounted
     * @param {UIElement | string} paymentMethod name or class of the paymentMethod
     * @param {object} options options that will be merged to the global Checkout props
     * @return {object} new UIElement
     */
    public create(paymentMethod: UIElement | string, options = {}): UIElement {
        const props = this.getPropsForComponent(options);
        return paymentMethod ? this.handleCreate(paymentMethod, props) : this.handleCreateError();
    }

    /**
     * Instantiates a new element component ready to be mounted from an action object
     * @param {PaymentAction} action action defining the component with the component data
     * @param {object} options options that will be merged to the global Checkout props
     * @return {object} new UIElement
     */
    public createFromAction(action: PaymentAction, options = {}): UIElement {
        if (action.type) {
            const props = this.getPropsForComponent(options);
            return getComponentForAction(action, props);
        }
        return this.handleCreateError();
    }

    /**
     * @private
     * @param {object} options options that will be merged to the global Checkout props
     * @return {object} props for a new UIElement
     */
    private getPropsForComponent(options) {
        return {
            paymentMethods: this.paymentMethodsResponse.paymentMethods,
            storedPaymentMethods: this.paymentMethodsResponse.storedPaymentMethods,
            ...this.options,
            ...options,
            i18n: this.modules.i18n,
            modules: this.modules,
            createFromAction: this.createFromAction
        };
    }

    /**
     * @private
     */
    private handleCreate(PaymentMethod, options: any = {}): UIElement {
        const isValidClass = PaymentMethod.prototype instanceof UIElement;

        if (isValidClass) {
            const paymentMethodsDetails = !options.supportedShopperInteractions ? this.paymentMethodsResponse.find(PaymentMethod.type) : [];
            const paymentMethodsConfiguration = getComponentConfiguration(PaymentMethod.type, options.paymentMethodsConfiguration);
            return new PaymentMethod({ ...paymentMethodsDetails, ...options, ...paymentMethodsConfiguration });
        }

        if (typeof PaymentMethod === 'string' && paymentMethods[PaymentMethod]) {
            return this.handleCreate(paymentMethods[PaymentMethod], options);
        }

        if (
            typeof PaymentMethod === 'string' &&
            this.paymentMethodsResponse.has(PaymentMethod) &&
            !this.paymentMethodsResponse.find(PaymentMethod).details
        ) {
            const paymentMethodsConfiguration = getComponentConfiguration(PaymentMethod, options.paymentMethodsConfiguration);
            return this.handleCreate(paymentMethods.redirect, {
                ...this.paymentMethodsResponse.find(PaymentMethod),
                ...options,
                ...paymentMethodsConfiguration
            });
        }

        return this.handleCreateError(PaymentMethod);
    }

    /**
     * @private
     */
    private handleCreateError(paymentMethod?): never {
        const paymentMethodName = paymentMethod && paymentMethod.name ? paymentMethod.name : 'The passed payment method';
        const errorMessage = paymentMethod ? `${paymentMethodName} is not a valid Checkout Component` : 'No Payment Method component was passed';

        throw new Error(errorMessage);
    }
}

export default Core;