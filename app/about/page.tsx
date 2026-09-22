import {Header,Footer} from '../components';

export default function About(){
  return <>
    <Header/>
    <section className="pageHero"><div className="container"><h1>About IRED</h1></div></section>
    <main className="container">
      <div className="contentCard">
        <h2>Institute of Research Education and Development (IRED)</h2>
        <p>The Institute of Research Education and Development (IRED) is an academic and research-oriented organization located in Ahmedabad, Gujarat, India. The Institute is approved by the Charity Commissioner, Ahmedabad, Government of Gujarat, under the Mumbai Public Trusts Act, 1950, with Registration No. GUJ/15856/AHMEDABAD.</p>
        <p>IRED is committed to promoting research, education, academic development, and the exchange of knowledge. It provides a platform where researchers, teachers, academicians, students, and professionals can share ideas, research findings, and scholarly work.</p>
        <p>The Institute encourages meaningful research across social, scientific, educational, economic, cultural, and technological areas, with the aim of supporting the academic community and wider society.</p>

        <h2>Our Publications</h2>
        <p><strong>GREEN: The Research Journal</strong> is an international, peer-reviewed, open-access research journal for original and unpublished research papers and scholarly articles across multiple disciplines.</p>
        <p><strong>RED: The Research Journal</strong> is presented on this website as the IRED research-book and compiled-volume publication stream.</p>

        <h2>Our Vision</h2>
        <p>To develop IRED as a meaningful platform for quality research, academic exchange, education, and knowledge development, while encouraging researchers to explore new ideas, address important academic and social issues, and contribute to the advancement of knowledge.</p>

        <h2>Our Mission</h2>
        <ul>
          <li>Promote quality and original research.</li>
          <li>Encourage multidisciplinary academic research.</li>
          <li>Provide platforms for researchers and students to share scholarly work.</li>
          <li>Support the dissemination of research through print and digital publications.</li>
          <li>Encourage academic interaction among researchers from different disciplines.</li>
          <li>Make scholarly knowledge more accessible to the academic community.</li>
          <li>Contribute to the growth of research education and development in India and globally.</li>
        </ul>

        <h2>Our Commitment</h2>
        <p>IRED is committed to creating an academic environment that encourages curiosity, originality, research ethics, knowledge sharing, and continuous learning. Through its research activities and publications, the Institute seeks to connect researchers and academic communities and support the wider dissemination of useful and meaningful research.</p>
      </div>
    </main>
    <Footer/>
  </>
}
