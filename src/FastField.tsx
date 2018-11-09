import * as React from 'react';
import { FormikProps, GenericFieldHTMLAttributes } from './types';

import { FormikConsumer } from './FormikContext';
import { getIn } from './utils';

export interface FastFieldProps<V = any> {
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

export interface FastFieldConfig<T> {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?:
    | string
    | React.ComponentType<FastFieldProps<any>>
    | React.ComponentType<void>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   */
  render?: ((props: FastFieldProps<any>) => React.ReactNode);

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?:
    | ((props: FastFieldProps<any>) => React.ReactNode)
    | React.ReactNode;

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

  /** Inner ref */
  innerRef?: (instance: any) => void;
}

export type FastFieldAttributes<T> = GenericFieldHTMLAttributes &
  FastFieldConfig<T> &
  T;

/**
 * Custom Field component for quickly hooking into Formik
 * context and wiring up forms.
 */

const areEqual = (prevProps, nextProps) => {
  if (
    getIn(prevProps.formik.values, prevProps.name) !==
      getIn(nextProps.formik.values, prevProps.name) ||
    getIn(prevProps.formik.errors, prevProps.name) !==
      getIn(nextProps.formik.errors, prevProps.name) ||
    getIn(prevProps.formik.touched, prevProps.name) !==
      getIn(nextProps.formik.touched, prevProps.name) ||
    Object.keys(prevProps).length !== Object.keys(nextProps).length ||
    prevProps.formik.isSubmitting !== nextProps.formik.isSubmitting
  ) {
    return false;
  }

  return true;
};

const MemoField = React.memo(Field, areEqual);
export const FastField = (props: FastFieldAttributes<{}>) => (
  <FormikConsumer>
    {formik => <MemoField formik={formik} {...props} />}
  </FormikConsumer>
);
