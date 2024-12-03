import spinner from './spinner.gif';

import styles from './Spinner.module.css';

const Spinner = () => {
  return (
    <div className={styles.container}>
      <img src={spinner} alt='LOADING...' className={styles.spinner} />
    </div>
  );
};

export default Spinner;