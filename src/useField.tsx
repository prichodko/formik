import { useFormikContext } from './FormikContext';
import { getIn } from './utils';

export const useField = (name: string) => {
  const { validate, validationSchema, ...formik } = useFormikContext();
  return {
    field: {
      name,
      value: getIn(formik.values, name),
      onChange: formik.handleChange,
      onBlur: formik.handleBlur,
    },
    meta: {
      error: getIn(formik.errors, name),
      touched: getIn(formik.values, name),
      initialValue: getIn(formik.initialValues, name),
    },
    form: formik,
  };
};
