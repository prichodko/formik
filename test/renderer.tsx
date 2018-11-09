import * as React from 'react';
import { render } from 'react-testing-library';

import { Formik, withFormik, FormikProps, FormikConfig } from '../src';
import { noop } from './testHelpers';

interface Values {
  name: string;
}

function Form({
  values,
  touched,
  handleSubmit,
  handleChange,
  handleBlur,
  status,
  errors,
  isSubmitting,
}: FormikProps<Values>) {
  return (
    <form onSubmit={handleSubmit} data-testid="form">
      <input
        type="text"
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.name}
        name="name"
        data-testid="name-input"
      />
      {touched.name && errors.name && <div id="feedback">{errors.name}</div>}
      {isSubmitting && <div id="submitting">Submitting</div>}
      {status &&
        !!status.myStatusMessage && (
          <div id="statusMessage">{status.myStatusMessage}</div>
        )}
      <button type="submit" data-testid="submit-button">
        Submit
      </button>
    </form>
  );
}

const initialValues = { name: 'jared', email: 'hello@reason.nyc' };
type Values = typeof initialValues;

function renderForm(
  ui?: React.ReactNode,
  props?: Partial<FormikConfig<Values>>
) {
  let injected: FormikProps<Values>;

  return {
    getFormProps(): FormikProps<Values> {
      return injected;
    },
    ...render(
      <Formik onSubmit={noop} initialValues={initialValues} {...props}>
        {(formikProps: FormikProps<Values>) =>
          (injected = formikProps) && ui ? ui : null
        }
      </Formik>
    ),
  };
}

const InitialValues: Values = { name: 'jared' };

export function renderFormik<V>(props?: Partial<FormikConfig<V>>) {
  const ref = React.createRef<Formik>();
  let injected: any;
  return {
    getProps(): FormikProps<V> {
      return injected;
    },
    getRef() {
      return ref;
    },
    ...render(
      <Formik
        ref={ref as any}
        onSubmit={noop as any}
        initialValues={InitialValues as any}
        {...props}
      >
        {(formikProps: FormikProps<V>) =>
          (injected = formikProps) && (
            <Form {...(formikProps as unknown) as FormikProps<Values>} />
          )
        }
      </Formik>
    ),
  };
}

export const renderWithFormik = (options?: any, props?: any) => {
  let injected: any;

  const FormikForm = withFormik<{}, Values>({
    mapPropsToValues: () => InitialValues,
    handleSubmit: noop,
    ...options,
  })(props => (injected = props) && <Form {...props} />);

  return {
    getProps() {
      return injected;
    },
    ...render(<FormikForm {...props} />),
  };
};

const createRenderField = (
  FieldComponent: React.ComponentClass<FieldConfig>
) => (
  props: Partial<FieldConfig> = {},
  formProps?: Partial<FormikConfig<Values>>
) => {
  let injected: FieldProps | FastFieldProps;

  if (!props.children && !props.render && !props.component) {
    props.children = (fieldProps: FieldProps | FastFieldProps) =>
      (injected = fieldProps) && null;
  }

  return {
    getProps() {
      return injected;
    },
    ...renderForm(<FieldComponent name="name" {...props} />, formProps),
  };
};

export const renderField = createRenderField(Field);
export const renderFastField = createRenderField(FastField);
