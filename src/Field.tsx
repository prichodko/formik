import * as React from 'react';
import warning from 'warning';

import { useFormikContext } from './FormikContext';
import { useField } from './useField';
import { FormikProps, GenericFieldHTMLAttributes } from './types';
import { isEmptyChildren, isFunction } from './utils';

/**
 * Note: These typings could be more restrictive, but then it would limit the
 * reusability of custom <Field/> components.
 *
 * @example
 * interface MyProps {
 *   ...
 * }
 *
 * export const MyInput: React.SFC<MyProps & FieldProps> = ({
 *   field,
 *   form,
 *   ...props
 * }) =>
 *   <div>
 *     <input {...field} {...props}/>
 *     {form.touched[field.name] && form.errors[field.name]}
 *   </div>
 */
export interface FieldProps<V = any> {
  field: {
    /** Classic React change handler, keyed by input name */
    onChange: (e: React.ChangeEvent<any>) => void;
    /** Mark input as touched */
    onBlur: (e: any) => void;
    /** Value of the input */
    value: any;
    /* name of the input */
    name: string;
  };
  form: FormikProps<V>; // if ppl want to restrict this for a given form, let them.
}

export interface FieldConfig {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?:
    | string
    | React.ComponentType<FieldProps<any>>
    | React.ComponentType<void>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   */
  render?: ((props: FieldProps<any>) => React.ReactNode);

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?: ((props: FieldProps<any>) => React.ReactNode) | React.ReactNode;

  /**
   * Validate a single field value independently
   */
  validate?: ((value: any) => string | Promise<void> | undefined);

  /**
   * Field name
   */
  name: string;

  /** HTML input type */
  type?: string;

  /** Field value */
  value?: any;
}

/**
 * Custom Field component for quickly hooking into Formik
 * context and wiring up forms.
 */
export type FieldAttributes = GenericFieldHTMLAttributes & FieldConfig;

export const Field = React.forwardRef((props: FieldAttributes, ref) => {
  warn(props); // drop in production

  const {
    name,
    validate,
    render,
    children,
    component = 'input',
    ...rest
  } = props;

  const formik = useFormikContext();

  React.useEffect(
    () => {
      if (validate) {
        formik.registerField(name, validate);
        return () => formik.unregisterField(name);
      }
    },
    [name, validate]
  );

  const bag = useField(name);

  if (render) {
    return render(bag);
  }

  if (isFunction(children)) {
    return children(bag);
  }

  if (typeof component === 'string') {
    return React.createElement(component, {
      ref,
      ...bag.field,
      ...rest,
      children,
    });
  }

  return React.createElement(component as any, {
    ref,
    ...bag,
    ...rest,
    children,
  });
});

const warn = (props: any) => {
  warning(
    !(props.component && props.render),
    'You should not use <Field component> and <Field render> in the same <Field> component; <Field component> will be ignored'
  );

  warning(
    !(props.component && props.children && isFunction(props.children)),
    'You should not use <Field component> and <Field children> as a function in the same <Field> component; <Field component> will be ignored.'
  );

  warning(
    !(props.render && props.children && !isEmptyChildren(props.children)),
    'You should not use <Field render> and <Field children> in the same <Field> component; <Field children> will be ignored'
  );
};
