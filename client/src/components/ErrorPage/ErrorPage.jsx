import { Link } from 'react-router-dom';

import styles from './ErrorPage.module.css';

const ErrorPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.number}>404</div>
      <div>
        <div className={styles.title}>PAGE NOT FOUND</div>
        <p className={styles.text}>Nothing interesting here, time to go <Link to='/' className={styles.link}>back</Link></p>
      </div>
    </div>
  );
};

export default ErrorPage;