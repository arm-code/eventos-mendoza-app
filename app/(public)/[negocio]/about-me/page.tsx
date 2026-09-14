'use client'
import Image from 'next/image';
import React from 'react';
import { Github, Youtube, Mail, Code2 } from 'lucide-react';

const AboutMePage = () => {
  return (
    <section className='min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center'>
      <div className='max-w-2xl w-full'>
        {/* Card Principal */}
        <div className='bg-white rounded-2xl shadow-sm border border-violet-100 p-8 sm:p-12 text-center'>
          {/* Foto de perfil */}
          <div className='flex justify-center mb-8'>
            <div className='relative'>
              {/* Aura animada con keyframes personalizados */}
              <div className='absolute inset-0 rounded-full bg-gradient-to-r from-violet-400 via-purple-500 to-violet-400 animate-aura scale-110 opacity-30 blur-md'></div>

              <div className='relative w-32 h-32 sm:w-40 sm:h-40'>
                <img
                  src='/profiles/square-alro.jpg'
                  alt='Foto de perfil de Alexis Romero Mendoza'
                  className='rounded-full object-cover shadow-xl relative z-10'
                />
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes aura {
              0%,
              100% {
                opacity: 0.3;
                transform: scale(1.1);
              }
              50% {
                opacity: 0.6;
                transform: scale(1.15);
              }
            }
            .animate-aura {
              animation: aura 3s ease-in-out infinite;
            }
          `}</style>

          {/* Información principal */}
          <div className='mb-8'>
            <p className='text-violet-500 text-sm'>Yo Soy</p>
            <h1 className='text-2xl sm:text-3xl font-bold text-violet-900 mb-3'>
              Alexis Romero Mendoza
            </h1>
            <div className='flex items-center justify-center gap-2 text-violet-600 mb-4'>
              <p className='text-lg'>Ingeniero en Sistemas Computacionales</p>
            </div>
            <p className='text-violet-500 text-sm'>
              Egresado de la Universidad Autónoma de Ciudad Juárez
            </p>
          </div>

          {/* Tecnologías */}
          <div className='mb-8'>
            <div className='flex items-center justify-center gap-2 mb-4'>
              <Code2 className='w-5 h-5 text-violet-600' />
              <h2 className='text-sm font-semibold uppercase tracking-widest text-violet-500'>
                Tecnologías
              </h2>
            </div>
            <div className='flex flex-wrap justify-center gap-2 text-sm'>
              {[
                'TypeScript', 'React', 'Next.js', 'NestJS', 'MySQL',
                'Sybase ASE', 'Linux', 'Docker', 'Tailwind', 'Supabase',
                'TypeORM', 'Ubuntu Server',
              ].map((tech, index) => (
                <span
                  key={index}
                  className='bg-violet-100 text-violet-700 px-3 py-1 rounded-full border border-violet-200 text-sm'
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Sitios */}
          <div className='mb-8'>
            <h2 className='text-sm font-semibold uppercase tracking-widest text-violet-500 mb-4'>
              Sitios
            </h2>
            <div className='flex justify-center gap-6'>
              <a
                href='https://github.com/arm-code'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2 text-violet-600 hover:text-violet-700 transition-colors group'
              >
                <div className='w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center group-hover:bg-violet-200 transition-colors'>
                  <Github className='w-5 h-5' />
                </div>
                <span className='text-sm font-medium'>GitHub</span>
              </a>
              <a
                href='https://youtube.com/@arm_code?si=8NH3gxtWjzi2_SKr'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2 text-violet-600 hover:text-violet-700 transition-colors group'
              >
                <div className='w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center group-hover:bg-violet-200 transition-colors'>
                  <Youtube className='w-5 h-5' />
                </div>
                <span className='text-sm font-medium'>YouTube</span>
              </a>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h2 className='text-sm font-semibold uppercase tracking-widest text-violet-500 mb-4'>
              Contacto
            </h2>
            <div className='flex flex-col sm:flex-row justify-center gap-4 sm:gap-8'>
              <a
                href='mailto:alexis.rm162917@gmail.com'
                className='flex items-center gap-2 text-violet-600 hover:text-violet-700 transition-colors group'
              >
                <div className='w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center group-hover:bg-violet-200 transition-colors'>
                  <Mail className='w-4 h-4' />
                </div>
                <span className='text-sm'>alexis.rm162917@gmail.com</span>
              </a>
              <a
                href='mailto:alexis.rinnegan@gmail.com'
                className='flex items-center gap-2 text-violet-600 hover:text-violet-700 transition-colors group'
              >
                <div className='w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center group-hover:bg-violet-200 transition-colors'>
                  <Mail className='w-4 h-4' />
                </div>
                <span className='text-sm'>alexis.rinnegan@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer adicional */}
        <div className='text-center mt-6'>
          <p className='text-violet-400 text-sm'>
            Desarrollado con el poder del fuego violeta 💜
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutMePage;
