interface Props {
  name: string;
}
export function Title({ name }: Props) {
  return (
    <h1 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">
      {name}
    </h1>
  );
}
