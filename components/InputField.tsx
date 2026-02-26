type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function InputField({
  label,
  className = "",
  ...rest
}: InputFieldProps) {
  return (
    <div className="flex flex-col w-full space-y-1">
      <label className="pl-5 font-semibold">{label}</label>
      <input
        className={`bg-gray-100 rounded-full py-1.5 px-5 ${className}`}
        {...rest}
      />
    </div>
  );
}
